import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { appointmentPrepInput, prepMemberContext } from "./appointment-prep";
import type { State } from "./store";

export const prepareAppointment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => appointmentPrepInput.parse(input))
  .handler(async ({ data, context }) => {
    const { data: households, error } = await context.supabase.from("households").select("data");
    if (error) return { ok: false as const, error: "Could not load this family member. Please try again." };
    const member = households?.flatMap((household) => ((household.data as Partial<State>)?.members ?? [])).find((m) => m.id === data.memberId && m.kind === "human");
    if (!member) return { ok: false as const, error: "This family member is not available in your account." };
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) return { ok: false as const, error: "AI appointment preparation is not configured yet." };
    const { generateAppointmentPrep } = await import("./appointment-prep.server");
    return generateAppointmentPrep(getRequest(), apiKey, data.concern, prepMemberContext(member));
  });