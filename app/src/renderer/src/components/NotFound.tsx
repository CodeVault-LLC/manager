import { Link } from "@tanstack/react-router";

export const NotFound: React.FC = () => {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-gradient-to-br px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md text-center">
        <div className="inline-block rounded-lg bg-primary px-6 py-4 text-[100px] font-bold tracking-tighter text-primary-foreground sm:text-[150px]">
          404
        </div>
        <h1 className="mt-8 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Oops, the page you were looking for doesn't exist
        </h1>
        <p className="mt-4 text-muted-foreground">
          The page you're looking for may have been moved or deleted. Don't
          worry, you can find plenty of other things on our homepage.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};
