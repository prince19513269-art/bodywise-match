import { ButtonLink } from "@/components/ui";
export default function NotFound() {
  return (
    <div className="container page-space empty-state">
      <h1>This page isn’t in our library.</h1>
      <p>The link may have changed. Explore the catalogue or return home.</p>
      <ButtonLink href="/">Back to home</ButtonLink>
    </div>
  );
}
