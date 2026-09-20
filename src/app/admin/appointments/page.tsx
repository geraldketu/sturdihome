import { requirePageAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge, Card } from "@/components/ui";

export default async function AdminAppointmentsPage() {
  await requirePageAccess("/admin/appointments");
  const appointments = await prisma.appointment.findMany({
    include: { homeowner: true, serviceRequest: { include: { assignedVendor: true } } },
    orderBy: { scheduledFor: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-dark">Appointments</h1>
        <p className="text-sm text-gray-600">Review appointments connected to SturdiHome service requests.</p>
      </div>
      {appointments.length === 0 ? <Card><p className="text-sm text-gray-500">No appointments booked yet.</p></Card> : <div className="space-y-3">{appointments.map((appointment) => <Card key={appointment.id}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-gray-900">{appointment.scheduledFor.toLocaleString()}</p>
            <p className="mt-1 text-sm text-gray-600">{appointment.homeowner.name} · {appointment.homeowner.email}</p>
            {appointment.serviceRequest && <p className="mt-1 text-sm text-gray-600">{appointment.serviceRequest.serviceType}{appointment.serviceRequest.assignedVendor ? ` · ${appointment.serviceRequest.assignedVendor.companyName}` : ""}</p>}
          </div>
          <Badge tone="gray">{appointment.status}</Badge>
        </div>
      </Card>)}</div>}
    </div>
  );
}
