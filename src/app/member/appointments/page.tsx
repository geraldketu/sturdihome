import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge, Card } from "@/components/ui";
import BookAppointmentForm from "./BookAppointmentForm";

export default async function AppointmentsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const [appointments, serviceRequests] = await Promise.all([
    prisma.appointment.findMany({
      where: { homeownerId: user.id },
      include: { serviceRequest: true },
      orderBy: { scheduledFor: "asc" },
    }),
    prisma.serviceRequest.findMany({
      where: { homeownerId: user.id },
      select: { id: true, serviceType: true, description: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-dark">Appointments</h1>
        <p className="text-sm text-gray-600">Book and track appointments tied to your service requests.</p>
      </div>

      <Card>
        <BookAppointmentForm requests={serviceRequests} />
      </Card>

      <Card>
        <h2 className="mb-3 font-semibold text-gray-900">Upcoming &amp; Past Appointments</h2>
        {appointments.length === 0 ? (
          <p className="text-sm text-gray-500">No appointments booked yet.</p>
        ) : (
          <ul className="space-y-3">
            {appointments.map((appt) => (
              <li key={appt.id} className="rounded-md border border-gray-100 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">
                    {appt.scheduledFor.toLocaleString()}
                  </span>
                  <Badge tone="gray">{appt.status}</Badge>
                </div>
                {appt.serviceRequest && (
                  <p className="mt-1 text-gray-600">{appt.serviceRequest.serviceType}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
