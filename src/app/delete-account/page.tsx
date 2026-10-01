import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { T } from "@/components/language-provider";

export const metadata = { title: "Delete your account — Are We Vibing" };
export default function DeleteAccount() {
  return <main id="content" className="flow-shell legal-shell"><Link className="back-link legal-back" href="/settings"><ArrowLeft size={20} aria-hidden="true" /><T text={"Settings"} /></Link><article className="prose">
    <h1><T text={"Delete your account"} /></h1>
    <p><T text={"You can request account deletion without installing the app or signing in."} /></p>
    <h2><T text={"Send a deletion request"} /></h2>
    <p><T text={"Email waelfeza@gmail.com with your app username. For a guest session, include its session link instead. Do not send your Google password."} /></p>
    <div className="deletion-action"><a className="button" href="mailto:waelfeza@gmail.com?subject=Are%20We%20Vibing%20account%20deletion"><Mail size={18} aria-hidden="true" /><T text={"Email deletion request"} /></a></div>
    <p><T text={"We handle requests manually and may ask you to verify that you own the account or session before deleting it."} /></p>
    <h2><T text={"What is deleted"} /></h2>
    <p><T text={"After ownership is verified, we delete your account profile, Google account identifier, friend connections and requests, invitations, and associated music sessions and results, including session notification tokens. These records have no additional retention period after deletion."} /></p>
    <p><T text={"Images or links previously exported by other people cannot be recalled. Service providers may retain operational logs under their own retention policies. You can also revoke Google and YouTube access from your Google account."} /></p>
    <p><Link href="/privacy"><T text={"Read the privacy policy"} /></Link></p>
  </article></main>;
}
