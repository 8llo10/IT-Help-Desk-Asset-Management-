import api from "./client";

export const getDashboardStats =
    () => {
        return api.get(
            "/dashboard/stats"
        );
    };

export const getRecentTickets =
    () => {
        return api.get(
            "/dashboard/recent-tickets"
        );
    };