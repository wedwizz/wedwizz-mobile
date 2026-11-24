import { useState } from "react";
import { INVITATION_TEMPLATES } from "@/features/user/data/planner";
import { useCustomerProfile } from "@/features/user/hooks/use-customer-profile";
import { useGoBack } from "@/features/user/hooks/use-go-back";
import { RequireUser } from "@/features/user/routes/guards";
import { initialDetails, invitationDateLabel, type InvitationDetails } from "./invitation-logic";
import { InvitationsView } from "./invitations-view";

const TEMPLATES = INVITATION_TEMPLATES.map((t) => ({ id: t.id, name: t.name }));

/** Web invitations-page.tsx. Customers only. Nothing is sent to the server: "Save design" is the web's demo. */
export function InvitationsScreen() {
  return (
    <RequireUser>
      <Invitations />
    </RequireUser>
  );
}

function Invitations() {
  const goBack = useGoBack();
  const profile = useCustomerProfile().data?.profile;
  const [templateId, setTemplateId] = useState(INVITATION_TEMPLATES[0].id);
  const [details, setDetails] = useState<InvitationDetails>(() => initialDetails(profile));
  const [full, setFull] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <InvitationsView
      onBack={goBack}
      templates={TEMPLATES}
      templateId={templateId}
      onTemplate={(id) => {
        setTemplateId(id);
        setSaved(false);
      }}
      details={details}
      onChange={(key, value) => {
        setDetails((d) => ({ ...d, [key]: value }));
        setSaved(false);
      }}
      dateLabel={invitationDateLabel(details.date)}
      fullOpen={full}
      onFull={() => setFull(true)}
      onCloseFull={() => setFull(false)}
      saved={saved}
      onSave={() => setSaved(true)}
    />
  );
}
