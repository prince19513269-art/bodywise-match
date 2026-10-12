import { PageHeading, Notice } from "@/components/ui";
export default function About() {
  return (
    <div className="container page-space about-page">
      <PageHeading
        label="OUR APPROACH"
        title="Clarity, with honest limits."
        description="Bodywise Match is an independent companion for understanding ingredients and exploring your care routine."
      />
      <section>
        <h2>Care starts with understanding</h2>
        <p>
          Get familiar with ingredients, explore products for the concerns that
          matter to you, and compare the details before making a choice. A
          little clarity can make your routine feel more approachable.
        </p>
      </section>
      <section>
        <h2>How discovery works today</h2>
        <p>
          Your concern, skin characteristics, irritation response and budget
          help narrow the options. Each suggestion explains why it appears, so
          you can explore at your own pace. These are products to research, with
          no guaranteed results.
        </p>
        <p>
          Product information comes from official brand pages. Prices and
          availability can change, and ingredient highlights are only part of
          the formula. Always check the current pack label before use.
        </p>
      </section>
      <section>
        <h2>Your preferences stay with you</h2>
        <p>
          We ask only for broad skincare preferences. No name, phone number,
          photograph, or medical history is required. Answers and comparison
          selections stay in this tab; refreshing or closing it clears them.
          Your answers are not sent to an external service. There are no
          analytics trackers.
        </p>
        <p>
          Visiting an official store or educational source takes you to another
          website with its own privacy practices.
        </p>
      </section>
      <Notice>
        This is not an official Be Bodywise application and is not endorsed by
        Mosaic Wellness. It is not a diagnostic tool or a replacement for
        professional dermatological advice. Seek professional care for serious
        or persistent concerns.
      </Notice>
    </div>
  );
}
