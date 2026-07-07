import "dotenv/config";
import "dotenv/config";
import {
  PrismaClient,
  Sentiment,
  TicketPriority,
  TicketStatus,
} from "@prisma/client";



const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to seed the database.");
}

const prisma = new PrismaClient();

const customers = [
  {
    name: "Maya Patel",
    email: "maya.patel@example.com",
  },
  {
    name: "Jon Bell",
    email: "jon.bell@example.com",
  },
  {
    name: "Elena Garcia",
    email: "elena.garcia@example.com",
  },
  {
    name: "Samir Khan",
    email: "samir.khan@example.com",
  },
];

const ticketTemplates: Array<{
  customerEmail: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: string;
  sentiment: Sentiment;
  messages: string[];
}> = [
  {
    customerEmail: "maya.patel@example.com",
    subject: "Package has been delayed for three days",
    status: "OPEN",
    priority: "HIGH",
    category: "Delivery Delay",
    sentiment: "NEGATIVE",
    messages: [
      "My ReeRoute delivery was due Monday and still has not arrived. Can someone check where it is?",
      "I can see the package is held at our North Hub due to a route backlog. I am asking dispatch for a fresh ETA now.",
      "Please prioritize it. The box contains inventory I need for an event tomorrow.",
      "We moved it to priority handling and expect delivery before 12 PM tomorrow.",
    ],
  },
  {
    customerEmail: "jon.bell@example.com",
    subject: "Refund request for missed guaranteed delivery",
    status: "PENDING",
    priority: "MEDIUM",
    category: "Refund",
    sentiment: "NEGATIVE",
    messages: [
      "I paid for guaranteed same-day delivery, but the order arrived the next afternoon.",
      "I am sorry the guarantee was missed. Please share the ReeRoute tracking number so I can verify the shipment.",
      "The tracking number is RR-48120-AX.",
      "Thank you. The scan history confirms the missed window, and I have submitted the refund for approval.",
      "How long does approval usually take?",
      "Most refunds are approved within two business days and returned to the original payment method.",
    ],
  },
  {
    customerEmail: "elena.garcia@example.com",
    subject: "Tracking page stopped updating",
    status: "RESOLVED",
    priority: "LOW",
    category: "Tracking Issue",
    sentiment: "NEUTRAL",
    messages: [
      "The ReeRoute tracking page has shown 'label created' since yesterday morning.",
      "The carrier scan did not sync correctly. I refreshed the tracking feed for your shipment.",
      "I can see the pickup scan now. Thanks.",
    ],
  },
  {
    customerEmail: "samir.khan@example.com",
    subject: "Driver went to my old address",
    status: "CLOSED",
    priority: "HIGH",
    category: "Wrong Address",
    sentiment: "NEUTRAL",
    messages: [
      "The driver attempted delivery at my previous office even though I updated the destination.",
      "I found the address correction on your account, but it was not applied to this shipment. I will reroute it today.",
      "Please send it to the Westlake office reception.",
      "Done. The shipment was delivered to Westlake reception and signed for at 4:18 PM.",
    ],
  },
  {
    customerEmail: "maya.patel@example.com",
    subject: "Damaged carton and missing items",
    status: "PENDING",
    priority: "URGENT",
    category: "Damaged Item",
    sentiment: "NEGATIVE",
    messages: [
      "The carton arrived crushed and two items were missing from the order.",
      "Please upload photos of the carton and packing slip so we can start a damage claim with ReeRoute.",
      "I uploaded the photos and highlighted the missing items.",
      "Received. We opened claim DMG-2147 and requested replacement dispatch.",
      "Can replacements ship today?",
      "Yes, replacement items are queued for express dispatch this evening.",
    ],
  },
  {
    customerEmail: "jon.bell@example.com",
    subject: "Delivery window keeps moving",
    status: "OPEN",
    priority: "MEDIUM",
    category: "Delivery Delay",
    sentiment: "NEGATIVE",
    messages: [
      "The delivery window has moved three times today and I need a reliable estimate.",
      "The route is running late after two failed dock appointments. I am checking the driver's remaining stops.",
      "Can you tell me whether it will arrive today?",
      "The driver has four stops left, and the current ETA is between 6:30 PM and 7:15 PM.",
    ],
  },
  {
    customerEmail: "elena.garcia@example.com",
    subject: "Refund has not posted",
    status: "PENDING",
    priority: "LOW",
    category: "Refund",
    sentiment: "NEUTRAL",
    messages: [
      "My refund was approved last week, but I do not see it on my card.",
      "I checked the refund record and it was released by ReeRoute on Friday.",
      "Is there a transaction reference I can give my bank?",
      "Yes, the reference is RF-88291. Banks can take three to five business days to post it.",
    ],
  },
  {
    customerEmail: "samir.khan@example.com",
    subject: "Tracking says delivered but no package",
    status: "OPEN",
    priority: "URGENT",
    category: "Tracking Issue",
    sentiment: "NEGATIVE",
    messages: [
      "Tracking says delivered, but nothing was left at our receiving desk.",
      "I am reviewing the proof of delivery and GPS location from the driver's scan.",
      "This shipment has client samples, so we need it found quickly.",
      "The GPS pin is one building over. I contacted the driver to recover and redeliver it.",
    ],
  },
  {
    customerEmail: "maya.patel@example.com",
    subject: "Need address corrected before pickup",
    status: "RESOLVED",
    priority: "MEDIUM",
    category: "Wrong Address",
    sentiment: "POSITIVE",
    messages: [
      "I entered Suite 210 instead of Suite 201 on a pickup scheduled for today.",
      "I updated the pickup notes to Suite 201 and confirmed it with the local ReeRoute dispatcher.",
      "That fixed it. The driver arrived at the correct suite.",
    ],
  },
  {
    customerEmail: "jon.bell@example.com",
    subject: "Fragile shipment arrived cracked",
    status: "OPEN",
    priority: "HIGH",
    category: "Damaged Item",
    sentiment: "NEGATIVE",
    messages: [
      "A fragile machine part arrived cracked even though the shipment was marked fragile.",
      "I am sorry about that. Please keep the packaging and send photos of the item and outer box.",
      "Photos are attached. The foam insert was split.",
      "Thanks. I opened a damage inspection and flagged the shipment for fragile handling review.",
    ],
  },
  {
    customerEmail: "elena.garcia@example.com",
    subject: "Late refrigerated delivery",
    status: "PENDING",
    priority: "URGENT",
    category: "Delivery Delay",
    sentiment: "NEGATIVE",
    messages: [
      "Our refrigerated delivery missed the morning window and the goods may expire.",
      "I am escalating this to cold-chain operations and checking the truck temperature logs.",
      "Please confirm whether the temperature stayed in range.",
      "The logs show the cargo stayed within range. We are prioritizing delivery on the next route.",
      "I need written confirmation for our records.",
      "I added the temperature report to the ticket and emailed a copy to you.",
    ],
  },
  {
    customerEmail: "samir.khan@example.com",
    subject: "Duplicate delivery charge refund",
    status: "RESOLVED",
    priority: "MEDIUM",
    category: "Refund",
    sentiment: "POSITIVE",
    messages: [
      "I was charged twice for the same ReeRoute delivery.",
      "I found the duplicate authorization and reversed the second charge.",
      "I see the pending charge disappeared. Thank you.",
    ],
  },
  {
    customerEmail: "maya.patel@example.com",
    subject: "Tracking number not recognized",
    status: "CLOSED",
    priority: "LOW",
    category: "Tracking Issue",
    sentiment: "NEUTRAL",
    messages: [
      "The tracking number from my confirmation email is not recognized.",
      "The final character was copied as the letter O instead of zero. Please try RR-73010.",
      "That works and I can see the shipment now.",
      "Great. I closed this ticket since tracking is now visible.",
    ],
  },
  {
    customerEmail: "jon.bell@example.com",
    subject: "Shipment routed to another city",
    status: "OPEN",
    priority: "HIGH",
    category: "Wrong Address",
    sentiment: "NEGATIVE",
    messages: [
      "My shipment is moving toward Portland, but it should be going to Seattle.",
      "I checked the routing label and found an incorrect postal code on the shipment.",
      "Can ReeRoute intercept it before delivery?",
      "Yes, we placed an intercept request and will redirect it from the Portland hub.",
    ],
  },
  {
    customerEmail: "elena.garcia@example.com",
    subject: "Box arrived wet",
    status: "PENDING",
    priority: "HIGH",
    category: "Damaged Item",
    sentiment: "NEGATIVE",
    messages: [
      "The package arrived wet and the documents inside are damaged.",
      "Please send photos of the wet packaging and damaged documents so we can file a claim.",
      "I sent the photos. The courier left it outside in the rain.",
      "We received them and escalated the handling issue to the delivery station.",
    ],
  },
  {
    customerEmail: "samir.khan@example.com",
    subject: "Delivery delayed by weather exception",
    status: "RESOLVED",
    priority: "LOW",
    category: "Delivery Delay",
    sentiment: "NEUTRAL",
    messages: [
      "Tracking says weather exception, but the weather is clear here.",
      "The exception was posted at the regional hub, not your destination. The truck left once roads reopened.",
      "Understood. It arrived this afternoon.",
    ],
  },
  {
    customerEmail: "maya.patel@example.com",
    subject: "Refund amount is lower than expected",
    status: "OPEN",
    priority: "MEDIUM",
    category: "Refund",
    sentiment: "NEGATIVE",
    messages: [
      "The refund only covered the delivery fee, but the product was returned too.",
      "I can review that. Was the product return processed through ReeRoute return pickup?",
      "Yes, pickup RR-92188 was completed last Thursday.",
      "I found the return scan and requested a corrected refund amount.",
    ],
  },
  {
    customerEmail: "jon.bell@example.com",
    subject: "Tracking shows out for delivery in wrong state",
    status: "PENDING",
    priority: "HIGH",
    category: "Tracking Issue",
    sentiment: "NEGATIVE",
    messages: [
      "My order says out for delivery in Nevada, but I am in Arizona.",
      "That looks like a tracking association issue. I am separating your shipment from the incorrect scan events.",
      "Does that mean my package is lost?",
      "No, your package is at the Phoenix hub. The tracking page should correct after the next scan.",
    ],
  },
  {
    customerEmail: "elena.garcia@example.com",
    subject: "Apartment number missing from label",
    status: "RESOLVED",
    priority: "MEDIUM",
    category: "Wrong Address",
    sentiment: "POSITIVE",
    messages: [
      "My apartment number is missing from the delivery label.",
      "I added Apartment 5B to the driver instructions and notified the route supervisor.",
      "The package was delivered to 5B. Thanks for fixing it quickly.",
    ],
  },
  {
    customerEmail: "samir.khan@example.com",
    subject: "Replacement item delayed",
    status: "OPEN",
    priority: "MEDIUM",
    category: "Delivery Delay",
    sentiment: "NEGATIVE",
    messages: [
      "The replacement ReeRoute promised has not moved since the label was created.",
      "I see the replacement missed the evening pickup. I am arranging pickup from the warehouse today.",
      "Please update me once it is scanned.",
      "I will add an activity note as soon as the first pickup scan posts.",
    ],
  },
  {
    customerEmail: "maya.patel@example.com",
    subject: "Damaged packaging but contents intact",
    status: "CLOSED",
    priority: "LOW",
    category: "Damaged Item",
    sentiment: "NEUTRAL",
    messages: [
      "The outer packaging was torn, but the contents look fine.",
      "Thanks for reporting it. We can log a packaging quality issue without opening a claim.",
      "That is fine. I just wanted ReeRoute to know.",
      "Logged with the station manager and closed as informational.",
    ],
  },
  {
    customerEmail: "jon.bell@example.com",
    subject: "Cannot download proof of delivery",
    status: "RESOLVED",
    priority: "LOW",
    category: "Tracking Issue",
    sentiment: "POSITIVE",
    messages: [
      "The proof of delivery link gives me an error.",
      "I regenerated the proof of delivery document and refreshed the link.",
      "The download works now.",
    ],
  },
  {
    customerEmail: "elena.garcia@example.com",
    subject: "Wrong return pickup address",
    status: "OPEN",
    priority: "HIGH",
    category: "Wrong Address",
    sentiment: "NEGATIVE",
    messages: [
      "The return pickup is scheduled at our billing address, not the warehouse.",
      "I can change that before dispatch. What warehouse address should ReeRoute use?",
      "Use 84 Harbor Road, Dock 3.",
      "Updated to 84 Harbor Road, Dock 3 and sent the correction to the pickup driver.",
    ],
  },
  {
    customerEmail: "samir.khan@example.com",
    subject: "Refund for damaged shipment",
    status: "PENDING",
    priority: "MEDIUM",
    category: "Refund",
    sentiment: "NEUTRAL",
    messages: [
      "The damage claim was approved, but I have not received the refund.",
      "I checked claim DMG-1982 and finance has approved the payout.",
      "Can you confirm the payout date?",
      "The refund is scheduled for release tomorrow morning.",
    ],
  },
  {
    customerEmail: "maya.patel@example.com",
    subject: "Courier marked customer unavailable",
    status: "OPEN",
    priority: "HIGH",
    category: "Delivery Delay",
    sentiment: "NEGATIVE",
    messages: [
      "The courier marked us unavailable, but our reception desk was staffed all day.",
      "I am sorry. I will review the driver's attempt notes and request a same-day reattempt.",
      "Please make sure they call reception this time.",
      "I added the reception phone number and requested a reattempt before 5 PM.",
    ],
  },
  {
    customerEmail: "jon.bell@example.com",
    subject: "Label created for wrong recipient",
    status: "CLOSED",
    priority: "MEDIUM",
    category: "Wrong Address",
    sentiment: "NEUTRAL",
    messages: [
      "The label shows another company as the recipient at my address.",
      "The sender selected an old recipient profile. I corrected the recipient name before pickup.",
      "The driver confirmed the right company name on the label.",
      "Thanks for confirming. I am closing this ticket.",
    ],
  },
];

async function main() {
  await prisma.activityLog.deleteMany();
  await prisma.internalNote.deleteMany();
  await prisma.message.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.customer.deleteMany();

  const createdCustomers = await Promise.all(
    customers.map((customer) =>
      prisma.customer.create({
        data: customer,
      }),
    ),
  );

  const customerByEmail = new Map(
    createdCustomers.map((customer) => [customer.email, customer.id]),
  );

  for (const template of ticketTemplates) {
    const customerId = customerByEmail.get(template.customerEmail);

    if (!customerId) {
      throw new Error(`Missing customer for ${template.customerEmail}`);
    }

    await prisma.ticket.create({
      data: {
        subject: template.subject,
        status: template.status,
        priority: template.priority,
        category: template.category,
        sentiment: template.sentiment,
        customerId,
        messages: {
          create: template.messages.map((content, index) => ({
            sender: index % 2 === 0 ? "CUSTOMER" : "AGENT",
            content,
          })),
        },
        internalNotes: {
          create: {
            author: "ReeRoute Support",
            content: `Seeded ${template.category.toLowerCase()} ticket for dashboard demo data.`,
          },
        },
        activityLogs: {
          create: [
            {
              action: "Ticket created",
            },
            {
              action: `Status set to ${template.status}`,
            },
          ],
        },
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
