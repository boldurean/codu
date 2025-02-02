import { EventForm } from "@/components/EventForm/EventForm";
import { getServerAuthSession } from "@/server/auth";
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import { db } from "@/server/db";

async function EditEventPage({ params }: { params: { event: string } }) {
  const session = await getServerAuthSession();

  if (!session) {
    redirect("/get-started");
  }

  if (!params?.event) {
    notFound();
  }

  const event = await db.query.event.findFirst({
    with: {
      RSVP: {
        with: {
          user: true,
        },
      },
      community: {
        columns: {
          excerpt: true,
          slug: true,
          name: true,
          city: true,
          country: true,
          coverImage: true,
        },
        with: {
          members: {
            columns: {
              id: true,
              isEventOrganiser: true,
              userId: true,
            },
          },
        },
      },
    },
    where: (event, { eq, and }) => and(eq(event.slug, params.event)),
  });

  if (!event) {
    notFound();
  }

  if (
    !event.community.members.some(
      (member) => member.userId === session.user?.id && member.isEventOrganiser,
    )
  ) {
    redirect("/forbidden");
  }

  const {
    address,
    description,
    name,
    id,
    capacity,
    eventDate,
    communityId,
    coverImage,
  } = event;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-grow flex-col justify-center px-4 sm:px-6 lg:col-span-9">
      <div className="bg-neutral-900 text-neutral-700 shadow-xl">
        <EventForm
          defaultValues={{
            address,
            description,
            name,
            id,
            capacity,
            eventDate,
            communityId,
            coverImage,
          }}
        />
      </div>
    </div>
  );
}

export default EditEventPage;
