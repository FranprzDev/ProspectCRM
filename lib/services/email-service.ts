import { ActivityType, EmailDirection } from "@/lib/domain/enums";
import { LogEmailInput } from "@/lib/validators/email.validator";
import { insertActivity } from "@/lib/db/activity-repository";
import { insertEmail } from "@/lib/db/email-repository";
import { findProspectById } from "@/lib/db/prospect-repository";

export async function logEmail(
  prospectId: string,
  input: LogEmailInput
): Promise<boolean> {
  const prospect = await findProspectById(prospectId);
  if (prospect === null) return false;
  await insertEmail({
    id: crypto.randomUUID(),
    prospectId,
    ...input,
    createdAt: Date.now(),
  });
  await insertActivity(
    prospectId,
    ActivityType.EmailLogged,
    `Mail ${input.direction === EmailDirection.Outbound ? "enviado" : "recibido"}: ${input.subject}`
  );
  return true;
}
