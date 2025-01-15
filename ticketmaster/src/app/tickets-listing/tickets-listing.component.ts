import { Component, OnInit } from '@angular/core';
import { TicketService } from '../services/ticket.service';
import { Ticket } from '../model/ticket.model';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-tickets-listing',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
  ],
  templateUrl: './tickets-listing.component.html',
  styleUrl: './tickets-listing.component.css',
})
export class TicketsListingComponent implements OnInit {
  tickets: Ticket[] = [];
  currentPage = 1;
  pageSize = 20;
  totalTickets = 0;
  searchTerm = '';

  constructor(private ticketService: TicketService) { }

  ngOnInit() {
    this.loadTickets();
  }

  loadTickets() {
    this.ticketService
      .getTickets(this.currentPage, this.pageSize, this.searchTerm)
      .subscribe((response) => {
        this.tickets = response;
      });
  }

  search() {
    if (this.searchTerm.length >= 3) {
      this.currentPage = 1;
      this.loadTickets();
    }
  }

  clearSearch() {
    this.searchTerm = '';
    this.currentPage = 1;
    this.loadTickets();
  }

  deleteTicket(id: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {

        this.ticketService
          .deleteTicket(id)
          .subscribe(() => {
            this.loadTickets();
          });

      }
    });
  }
  
}
