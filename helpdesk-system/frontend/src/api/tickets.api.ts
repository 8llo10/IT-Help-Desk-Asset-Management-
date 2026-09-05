import api from "./client";

export const getTickets = () => {
    return api.get("/tickets");
};

export const createTicket = (
    data: unknown
) => {
    return api.post(
        "/tickets",
        data
    );
};

export const getTicketComments = (
    ticketId: number
) => {
    return api.get(
        `/tickets/${ticketId}/comments`
    );
};

export const addTicketComment = (
    ticketId: number,
    data: unknown
) => {
    return api.post(
        `/tickets/${ticketId}/comments`,
        data
    );
};

export const getTicketHistory = (
    ticketId: number
) => {
    return api.get(
        `/tickets/${ticketId}/history`
    );
};

export const assignTicket = (
    ticketId: number,
    assignedToId: number
) => {
    return api.patch(
        `/tickets/${ticketId}/assign`,
        {
            assignedToId,
        }
    );
};

export const updateTicketStatus = (
    ticketId: number,
    status: string
) => {
    return api.patch(
        `/tickets/${ticketId}/status`,
        {
            status,
        }
    );
};