# Manager

> Designed with simplicity and overview in mind.

> [!CAUTION]
>  This repository is fully in development and is not ready for production use. It is not recommended to use this repository in production environments.

> [!NOTE]
> Manager's server is getting removed and outdated. The Manager server is getting moved into a private repository, and will not be kept public. Manager now functions without the requirement of a user, although potential changes will be coming soon.

This repository contains the Manager Application.

## Desktop OAuth Setup (GitHub)

To enable the GitHub integration in the desktop app, configure these
environment variables before starting development:

- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`

The GitHub OAuth App callback URL must be:

- `manager://oauth/callback`

A template is available at `apps/desktop/.env.example`.

## Goal

This project revolves around the idea of a personal dashboard application, with integrations to various services, and a focus on simplicity and overview. The goal is to create an application that allows users to easily access and manage their various accounts and services in one place, without the need for multiple applications or websites.

## Who

This project is made for Developers, and users who want to have a personal dashboard application without the need for multiple applications or websites.