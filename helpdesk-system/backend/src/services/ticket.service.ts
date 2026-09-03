import prisma from "../config/prisma.js";

interface CreateTicketInput {
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  categoryId: number;
  createdById: number;
  assetId?: number | null;
}

type TicketStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED";

export const createTicket = async (data: CreateTicketInput) => {
  const ticketCount = await prisma.ticket.count();

  const ticketNumber = `TK-${String(ticketCount + 1).padStart(5, "0")}`;

  return prisma.ticket.create({
    data: {
      ...data,
      ticketNumber,
    },
    include: {
      category: true,
      asset: true,
      createdBy: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
  });
};

export const getAllTickets = async () => {
  return prisma.ticket.findMany({
    include: {
      category: true,
      asset: true,

      createdBy: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },

      assignedTo: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getTicketsByEmployee = async (userId: number) => {
  return prisma.ticket.findMany({
    where: {
      createdById: userId,
    },

    include: {
      category: true,
      asset: true,

      assignedTo: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getTicketsByTechnician = async (userId: number) => {
  return prisma.ticket.findMany({
    where: {
      assignedToId: userId,
    },

    include: {
      category: true,
      asset: true,

      createdBy: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });
};

export const assignTicket = async (
  ticketId: number,
  technicianId: number
) => {
  const ticket = await prisma.ticket.findUnique({
    where: {
      id: ticketId,
    },
  });

  if (!ticket) {
    throw new Error("TICKET_NOT_FOUND");
  }

  const technician = await prisma.user.findUnique({
    where: {
      id: technicianId,
    },
  });

  if (!technician) {
    throw new Error("TECHNICIAN_NOT_FOUND");
  }

  if (technician.role !== "TECHNICIAN") {
    throw new Error("USER_NOT_TECHNICIAN");
  }

  if (!technician.isActive) {
    throw new Error("TECHNICIAN_INACTIVE");
  }

  return prisma.ticket.update({
    where: {
      id: ticketId,
    },

    data: {
      assignedToId: technicianId,
    },

    include: {
      assignedTo: {
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
        },
      },

      createdBy: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },

      category: true,
      asset: true,
    },
  });
};

const allowedTransitions: Record<TicketStatus, TicketStatus[]> = {
  OPEN: ["IN_PROGRESS"],
  IN_PROGRESS: ["RESOLVED"],
  RESOLVED: ["CLOSED"],
  CLOSED: [],
};

export const changeTicketStatus = async (
  ticketId: number,
  newStatus: TicketStatus,
  userId: number,
  userRole: string
) => {
  const ticket = await prisma.ticket.findUnique({
    where: {
      id: ticketId,
    },
  });

  if (!ticket) {
    throw new Error("TICKET_NOT_FOUND");
  }

  const currentStatus = ticket.status as TicketStatus;

  if (!allowedTransitions[currentStatus].includes(newStatus)) {
    throw new Error("INVALID_STATUS_TRANSITION");
  }

  if (
    newStatus === "IN_PROGRESS" ||
    newStatus === "RESOLVED"
  ) {
    if (
      userRole !== "ADMIN" &&
      ticket.assignedToId !== userId
    ) {
      throw new Error("NOT_ASSIGNED_TECHNICIAN");
    }

    if (!ticket.assignedToId) {
      throw new Error("TICKET_NOT_ASSIGNED");
    }
  }

  if (newStatus === "CLOSED") {
    if (
      userRole !== "ADMIN" &&
      ticket.createdById !== userId
    ) {
      throw new Error("NOT_TICKET_OWNER");
    }
  }

  return prisma.ticket.update({
    where: {
      id: ticketId,
    },

    data: {
      status: newStatus,

      ...(newStatus === "RESOLVED" && {
        resolvedAt: new Date(),
      }),

      ...(newStatus === "CLOSED" && {
        closedAt: new Date(),
      }),
    },

    include: {
      category: true,
      asset: true,

      createdBy: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },

      assignedTo: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
  });
};