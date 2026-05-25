import crypto from "node:crypto";
import type {
  GithubNotificationItem,
  GithubNotificationsState,
} from "@manager/contracts";
import {
  DEFAULT_GITHUB_NOTIFICATIONS_STATE,
  type GithubNotificationSubject,
  type GithubNotificationRepository,
} from "@manager/contracts";
import type { AppDatabase } from "../database.ts";
import { readSettings } from "../settingsService.ts";
import {
  readGithubNotificationsState,
  writeGithubNotificationsState,
} from "./githubNotificationsStore.ts";

const GITHUB_NOTIFICATIONS_URL = "https://api.github.com/notifications";
const FALLBACK_POLL_INTERVAL_SECONDS = 60;
const MIN_POLL_INTERVAL_SECONDS = 15;
const MAX_STORED_NOTIFICATIONS = 50;

function resolvePollInterval(value: string | null): number {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return FALLBACK_POLL_INTERVAL_SECONDS;
  }
  return Math.max(MIN_POLL_INTERVAL_SECONDS, parsed);
}

function mapSubject(raw: Record<string, unknown>): GithubNotificationSubject {
  return {
    title: String(raw["title"] ?? "Untitled notification"),
    type: String(raw["type"] ?? "Notification"),
    url: raw["url"] ? String(raw["url"]) : null,
    latestCommentUrl: raw["latest_comment_url"]
      ? String(raw["latest_comment_url"])
      : null,
  };
}

function mapRepository(
  raw: Record<string, unknown>,
): GithubNotificationRepository {
  return {
    fullName: String(raw["full_name"] ?? "unknown/unknown"),
    htmlUrl: String(raw["html_url"] ?? "https://github.com"),
  };
}

function resolveWebUrl(
  subjectUrl: string | null,
  repositoryHtmlUrl: string,
): string | null {
  if (!subjectUrl) return null;

  // Convert GitHub API resource URLs to user-facing web URLs when possible.
  const issueMatch = subjectUrl.match(
    /^https:\/\/api\.github\.com\/repos\/([^/]+)\/([^/]+)\/issues\/(\d+)$/,
  );
  if (issueMatch) {
    const [, owner, repo, number] = issueMatch;
    return `https://github.com/${owner}/${repo}/issues/${number}`;
  }

  const pullMatch = subjectUrl.match(
    /^https:\/\/api\.github\.com\/repos\/([^/]+)\/([^/]+)\/pulls\/(\d+)$/,
  );
  if (pullMatch) {
    const [, owner, repo, number] = pullMatch;
    return `https://github.com/${owner}/${repo}/pull/${number}`;
  }

  const commitMatch = subjectUrl.match(
    /^https:\/\/api\.github\.com\/repos\/([^/]+)\/([^/]+)\/commits\/([a-f0-9]+)$/i,
  );
  if (commitMatch) {
    const [, owner, repo, sha] = commitMatch;
    return `https://github.com/${owner}/${repo}/commit/${sha}`;
  }

  return repositoryHtmlUrl;
}

function mapNotification(raw: Record<string, unknown>): GithubNotificationItem {
  const subjectRaw =
    typeof raw["subject"] === "object" && raw["subject"] !== null
      ? (raw["subject"] as Record<string, unknown>)
      : {};
  const repositoryRaw =
    typeof raw["repository"] === "object" && raw["repository"] !== null
      ? (raw["repository"] as Record<string, unknown>)
      : {};

  const subject = mapSubject(subjectRaw);
  const repository = mapRepository(repositoryRaw);

  return {
    id: String(raw["id"] ?? crypto.randomUUID()),
    unread: Boolean(raw["unread"]),
    reason: String(raw["reason"] ?? "subscribed"),
    updatedAt: String(raw["updated_at"] ?? new Date().toISOString()),
    lastReadAt: raw["last_read_at"] ? String(raw["last_read_at"]) : null,
    webUrl: resolveWebUrl(subject.url, repository.htmlUrl),
    subject,
    repository,
  };
}

export async function pollGithubNotifications(
  db: AppDatabase,
): Promise<number> {
  const settings = readSettings(db);
  const github = settings.integrations.github;

  if (!github.enabled || !github.accessToken) {
    return FALLBACK_POLL_INTERVAL_SECONDS;
  }

  const cached = readGithubNotificationsState(db);

  let response: Response;
  try {
    response = await fetch(GITHUB_NOTIFICATIONS_URL, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${github.accessToken}`,
        "X-GitHub-Api-Version": "2022-11-28",
        ...(cached.etag ? { "If-None-Match": cached.etag } : {}),
      },
    });
  } catch (error) {
    console.warn("[github-notifications] poll request failed", { error });
    return Math.max(
      MIN_POLL_INTERVAL_SECONDS,
      cached.pollIntervalSeconds || FALLBACK_POLL_INTERVAL_SECONDS,
    );
  }

  const pollIntervalSeconds = resolvePollInterval(
    response.headers.get("X-Poll-Interval"),
  );
  const checkedAt = new Date().toISOString();

  if (response.status === 304) {
    const state304: GithubNotificationsState = {
      ...cached,
      pollIntervalSeconds,
      lastCheckedAt: checkedAt,
      etag: response.headers.get("ETag") ?? cached.etag,
    };
    writeGithubNotificationsState(db, state304);

    console.info("[github-notifications] polled", {
      status: 304,
      pollIntervalSeconds,
      etag: state304.etag,
      itemCount: state304.items.length,
    });

    return pollIntervalSeconds;
  }

  if (!response.ok) {
    console.warn("[github-notifications] poll failed", {
      status: response.status,
      pollIntervalSeconds,
    });
    return pollIntervalSeconds;
  }

  const payload = (await response.json()) as unknown;
  const rawItems = Array.isArray(payload) ? payload : [];
  const mappedItems = rawItems
    .filter(
      (item): item is Record<string, unknown> =>
        typeof item === "object" && item !== null,
    )
    .map((item) => mapNotification(item))
    .slice(0, MAX_STORED_NOTIFICATIONS);

  const nextState: GithubNotificationsState = {
    items: mappedItems,
    etag: response.headers.get("ETag") ?? cached.etag,
    pollIntervalSeconds,
    lastCheckedAt: checkedAt,
  };

  writeGithubNotificationsState(db, nextState);

  console.info("[github-notifications] polled", {
    status: response.status,
    pollIntervalSeconds,
    etag: nextState.etag,
    itemCount: nextState.items.length,
    sample: nextState.items.slice(0, 5).map((item) => ({
      id: item.id,
      reason: item.reason,
      title: item.subject.title,
      repository: item.repository.fullName,
      webUrl: item.webUrl,
      updatedAt: item.updatedAt,
    })),
  });

  return pollIntervalSeconds;
}

export function clearGithubNotificationsCache(db: AppDatabase): void {
  writeGithubNotificationsState(db, DEFAULT_GITHUB_NOTIFICATIONS_STATE);
}
