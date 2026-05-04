interface OAuthDriver {
  /**
   * Starts the OAuth flow to authenticate with GitHub. This typically involves opening a browser window for the user to log in and authorize the application, then receiving an access token that can be used for API requests.
   */
  startFlow(): Promise<void>;

  /**
   * Completes the OAuth flow after the user has authorized the application. This method should be called with the callback URL that GitHub redirects to after authorization, which contains the necessary information (e.g., authorization code) to exchange for an access token.
   * @param callbackUrl The URL that GitHub redirects to after the user authorizes the application, containing the authorization code or token information.
   * @returns A promise that resolves to the access token string if the flow is completed successfully, or rejects with an error if there was a problem completing the flow.
   */
  completeFlow(callbackUrl: string): Promise<string>;
}

export class GithubDriver implements OAuthDriver {
  startFlow(): Promise<void> {}
}
