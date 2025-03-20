export class Blog {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: Date = new Date();
  isMembership: boolean;
}
