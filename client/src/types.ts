import { type Event } from "react-big-calendar";

export interface Appointment extends Event {
  id?: number;
  clientName: string;
  phoneNumber?: string;
  serviceType: string;
  price: number;
  attended: boolean;
  clientId?: number;
}
