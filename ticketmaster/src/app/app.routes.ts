import { Routes } from '@angular/router';
import { TicketsListingComponent } from './tickets-listing/tickets-listing.component';
import { TicketAddEditComponent } from './ticket-add-edit/ticket-add-edit.component';

export const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: 'tickets' },

    { path: "tickets", component: TicketsListingComponent },
    { path: "tickets/edit/:id", component: TicketAddEditComponent },
    { path: "tickets/create", component: TicketAddEditComponent },

];