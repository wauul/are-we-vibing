import Link from "next/link";

export const metadata = { title: "Delete your account — Are We Vibing" };
export default function DeleteAccount() {
  return <main id="content" className="flow-shell"><article className="prose">
    <h1>Delete your Are We Vibing account</h1>
    <p>You can request account deletion without installing the app or signing in.</p>
    <h2>Send a deletion request</h2>
    <p>Email <a href="mailto:waelfeza@gmail.com?subject=Are%20We%20Vibing%20account%20deletion">waelfeza@gmail.com</a> with the subject “Are We Vibing account deletion” and your app username. For a guest session, include its session link instead. Do not send your Google password.</p>
    <p>We handle requests manually and may ask you to verify that you own the account or session before deleting it.</p>
    <h2>What is deleted</h2>
    <p>After ownership is verified, we delete your account profile, Google account identifier, friend connections and requests, invitations, and associated music sessions and results, including session notification tokens. These records have no additional retention period after deletion.</p>
    <p>Images or links previously exported by other people cannot be recalled. Service providers may retain operational logs under their own retention policies. You can also revoke Google and YouTube access from your Google account.</p>
    <p><Link href="/privacy">Read the privacy policy</Link> · <Link href="/friends">Back to your music circle</Link></p>
  </article></main>;
}
