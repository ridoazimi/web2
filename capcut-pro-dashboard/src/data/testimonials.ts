export type TestimonialItem = {
  id: string;
  type: "image" | "video";
  mediaUrl: string;
  customerName: string;
  topTag?: string;
  statusText?: string;
};

export const mockTestimonials: TestimonialItem[] = [
  {
    id: "1",
    type: "image",
    mediaUrl: "https://picsum.photos/seed/testimoni1/600/800",
    customerName: "Ahmad Rizky",
    topTag: "WhatsApp",
    statusText: "Verified Buyer via WhatsApp",
  },
  {
    id: "2",
    type: "video",
    mediaUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    customerName: "Siti Nurhaliza",
    topTag: "WhatsApp",
    statusText: "Verified Buyer via WhatsApp",
  },
  {
    id: "3",
    type: "image",
    mediaUrl: "https://picsum.photos/seed/testimoni3/600/800",
    customerName: "Budi Kusuma",
    topTag: "Instagram",
    statusText: "Verified Buyer via WhatsApp",
  },
  {
    id: "4",
    type: "video",
    mediaUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    customerName: "Dewi Lestari",
    topTag: "WhatsApp",
    statusText: "Verified Buyer via WhatsApp",
  },
  {
    id: "5",
    type: "image",
    mediaUrl: "https://picsum.photos/seed/testimoni5/600/800",
    customerName: "Rizki Pratama",
    topTag: "WhatsApp",
    statusText: "Verified Buyer via WhatsApp",
  },
  {
    id: "6",
    type: "image",
    mediaUrl: "https://picsum.photos/seed/testimoni6/600/800",
    customerName: "Maya Sari",
    topTag: "WhatsApp",
    statusText: "Verified Buyer via WhatsApp",
  },
];
