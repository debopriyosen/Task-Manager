import { redirect } from "next/navigation";

export default function Home() {
  // Currently redirecting all root traffic to dashboard.
  // In the future this might be a landing page.
  redirect("/dashboard");
}
<h1>Test Deployment</h1>