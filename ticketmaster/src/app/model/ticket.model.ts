
export interface CreateTicket {
    name: string;
}

export interface Ticket extends CreateTicket {
    sorting_id: number;
    _id: string;
}