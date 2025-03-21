import type { Metadata } from "next"
import { DocNavigation } from "@/components/doc-navigation"

export const metadata: Metadata = {
  title: "Code of Conduct | LaserEyes Documentation",
  description: "Code of Conduct for the LaserEyes community and contributors",
}

export default function CodeOfConductPage() {
  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-4xl font-bold mb-6">Code of Conduct</h1>
      <p className="text-lg mb-8">
        We are committed to providing a friendly, safe, and welcoming environment for all contributors and participants
        in the LaserEyes community, regardless of level of experience, gender identity and expression, sexual
        orientation, disability, personal appearance, body size, race, ethnicity, age, religion, nationality, or other
        similar characteristic.
      </p>

      <div className="space-y-12">
        <section id="our-standards">
          <h2 className="text-2xl font-bold mb-4">Our Standards</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">
                Examples of behavior that contributes to creating a positive environment:
              </h3>

              <ul className="list-disc pl-6 space-y-2">
                <li>Using welcoming and inclusive language</li>
                <li>Being respectful of differing viewpoints and experiences</li>
                <li>Gracefully accepting constructive criticism</li>
                <li>Focusing on what is best for the community</li>
                <li>Showing empathy towards other community members</li>
                <li>Helping and mentoring new contributors</li>
                <li>Giving credit where credit is due</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Examples of unacceptable behavior:</h3>

              <ul className="list-disc pl-6 space-y-2">
                <li>The use of sexualized language or imagery and unwelcome sexual attention or advances</li>
                <li>Trolling, insulting/derogatory comments, and personal or political attacks</li>
                <li>Public or private harassment</li>
                <li>
                  Publishing others' private information, such as a physical or electronic address, without explicit
                  permission
                </li>
                <li>Other conduct which could reasonably be considered inappropriate in a professional setting</li>
                <li>Advocating for or encouraging any of the above behavior</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="responsibilities">
          <h2 className="text-2xl font-bold mb-4">Our Responsibilities</h2>

          <div className="space-y-4">
            <p>
              Project maintainers are responsible for clarifying the standards of acceptable behavior and are expected
              to take appropriate and fair corrective action in response to any instances of unacceptable behavior.
            </p>

            <p>
              Project maintainers have the right and responsibility to remove, edit, or reject comments, commits, code,
              wiki edits, issues, and other contributions that are not aligned with this Code of Conduct, or to ban
              temporarily or permanently any contributor for other behaviors that they deem inappropriate, threatening,
              offensive, or harmful.
            </p>
          </div>
        </section>

        <section id="scope">
          <h2 className="text-2xl font-bold mb-4">Scope</h2>

          <div className="space-y-4">
            <p>
              This Code of Conduct applies both within project spaces and in public spaces when an individual is
              representing the project or its community. Examples of representing a project or community include using
              an official project email address, posting via an official social media account, or acting as an appointed
              representative at an online or offline event.
            </p>

            <p>Representation of a project may be further defined and clarified by project maintainers.</p>
          </div>
        </section>

        <section id="enforcement">
          <h2 className="text-2xl font-bold mb-4">Enforcement</h2>

          <div className="space-y-4">
            <p>
              Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by contacting the
              project team at{" "}
              <a href="mailto:conduct@omnisat.io" className="text-primary hover:underline">
                conduct@omnisat.io
              </a>
              . All complaints will be reviewed and investigated promptly and fairly.
            </p>

            <p>
              All project maintainers are obligated to respect the privacy and security of the reporter of any incident.
            </p>

            <p>
              Project maintainers who do not follow or enforce the Code of Conduct in good faith may face temporary or
              permanent repercussions as determined by other members of the project's leadership.
            </p>
          </div>
        </section>

        <section id="enforcement-guidelines">
          <h2 className="text-2xl font-bold mb-4">Enforcement Guidelines</h2>

          <div className="space-y-6">
            <p>
              Project maintainers will follow these Community Impact Guidelines in determining the consequences for any
              action they deem in violation of this Code of Conduct:
            </p>

            <div>
              <h3 className="text-xl font-semibold mb-2">1. Correction</h3>

              <p className="mb-2">
                <strong>Community Impact:</strong> Use of inappropriate language or other behavior deemed unprofessional
                or unwelcome in the community.
              </p>

              <p>
                <strong>Consequence:</strong> A private, written warning from project maintainers, providing clarity
                around the nature of the violation and an explanation of why the behavior was inappropriate. A public
                apology may be requested.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">2. Warning</h3>

              <p className="mb-2">
                <strong>Community Impact:</strong> A violation through a single incident or series of actions.
              </p>

              <p>
                <strong>Consequence:</strong> A warning with consequences for continued behavior. No interaction with
                the people involved, including unsolicited interaction with those enforcing the Code of Conduct, for a
                specified period of time. This includes avoiding interactions in community spaces as well as external
                channels like social media. Violating these terms may lead to a temporary or permanent ban.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">3. Temporary Ban</h3>

              <p className="mb-2">
                <strong>Community Impact:</strong> A serious violation of community standards, including sustained
                inappropriate behavior.
              </p>

              <p>
                <strong>Consequence:</strong> A temporary ban from any sort of interaction or public communication with
                the community for a specified period of time. No public or private interaction with the people involved,
                including unsolicited interaction with those enforcing the Code of Conduct, is allowed during this
                period. Violating these terms may lead to a permanent ban.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">4. Permanent Ban</h3>

              <p className="mb-2">
                <strong>Community Impact:</strong> Demonstrating a pattern of violation of community standards,
                including sustained inappropriate behavior, harassment of an individual, or aggression toward or
                disparagement of classes of individuals.
              </p>

              <p>
                <strong>Consequence:</strong> A permanent ban from any sort of public interaction within the community.
              </p>
            </div>
          </div>
        </section>

        <section id="attribution">
          <h2 className="text-2xl font-bold mb-4">Attribution</h2>

          <div className="space-y-4">
            <p>
              This Code of Conduct is adapted from the{" "}
              <a href="https://www.contributor-covenant.org" className="text-primary hover:underline">
                Contributor Covenant
              </a>
              , version 2.0, available at{" "}
              <a
                href="https://www.contributor-covenant.org/version/2/0/code_of_conduct.html"
                className="text-primary hover:underline"
              >
                https://www.contributor-covenant.org/version/2/0/code_of_conduct.html
              </a>
              .
            </p>

            <p>
              Community Impact Guidelines were inspired by{" "}
              <a href="https://github.com/mozilla/diversity" className="text-primary hover:underline">
                Mozilla's code of conduct enforcement ladder
              </a>
              .
            </p>

            <p>
              For answers to common questions about this code of conduct, see the FAQ at{" "}
              <a href="https://www.contributor-covenant.org/faq" className="text-primary hover:underline">
                https://www.contributor-covenant.org/faq
              </a>
              .
            </p>
          </div>
        </section>
      </div>

      <DocNavigation
        prev={{ title: "Pull Request Guidelines", href: "/docs/pr-guidelines" }}
        next={{ title: "Wallet Connection", href: "/docs/wallet-connection" }}
      />
    </div>
  )
}

