"use client";

import { signInAction } from "@/actions/authAction";
import { Button } from "@/components/ui/Button";
import { Check, Sparkles, Calendar, FolderKanban, Search, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm text-primary">
            <Sparkles className="h-4 w-4" />
            <span>Organize your life, one task at a time</span>
          </div>
          
          <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl">
            Get things done with
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {" "}clarity
            </span>
          </h1>
          
          <p className="mb-10 text-xl text-muted-foreground md:text-2xl">
            The smart way to manage your tasks, projects, and deadlines.
            Stay organized, stay productive.
          </p>
          
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <form action={signInAction} className="w-full sm:w-auto">
              <Button type="submit" size="lg" className="w-full text-lg sm:w-auto">
                Get Started Free
              </Button>
            </form>
            <Button variant="outline" size="lg" className="w-full text-lg sm:w-auto">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-4 text-center text-3xl font-bold md:text-4xl">
            Everything you need to stay organized
          </h2>
          <p className="mb-16 text-center text-lg text-muted-foreground">
            Powerful features designed to help you achieve more
          </p>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="group rounded-xl border bg-card p-6 transition-all hover:shadow-lg hover:shadow-primary/10">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FolderKanban className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Projects & Tasks</h3>
              <p className="text-muted-foreground">
                Organize your work into projects and break them down into manageable tasks.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group rounded-xl border bg-card p-6 transition-all hover:shadow-lg hover:shadow-primary/10">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Smart Scheduling</h3>
              <p className="text-muted-foreground">
                Plan your day with today and upcoming views. Never miss a deadline again.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group rounded-xl border bg-card p-6 transition-all hover:shadow-lg hover:shadow-primary/10">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Quick Search</h3>
              <p className="text-muted-foreground">
                Find anything instantly with powerful search across all your tasks and projects.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group rounded-xl border bg-card p-6 transition-all hover:shadow-lg hover:shadow-primary/10">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Rich Text Editor</h3>
              <p className="text-muted-foreground">
                Add detailed descriptions with formatting, lists, and images to your tasks.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group rounded-xl border bg-card p-6 transition-all hover:shadow-lg hover:shadow-primary/10">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Check className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Labels & Organization</h3>
              <p className="text-muted-foreground">
                Categorize and filter your tasks with custom labels for better organization.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group rounded-xl border bg-card p-6 transition-all hover:shadow-lg hover:shadow-primary/10">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Beautiful UI</h3>
              <p className="text-muted-foreground">
                Enjoy a clean, modern interface designed for productivity and focus.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-4xl rounded-2xl border bg-gradient-to-br from-primary/10 to-primary/5 p-12 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Ready to get organized?
          </h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Join thousands of users who are already more productive
          </p>
          <form action={signInAction}>
            <Button type="submit" size="lg" className="text-lg">
              Start Free Today
            </Button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 todoit. Built with Next.js and Convex.</p>
        </div>
      </footer>
    </div>
  );
}
