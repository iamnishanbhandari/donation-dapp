// Example campaigns to test similarity algorithm
export const testCampaigns = [
  {
    id: 1,
    owner: "0x123...",
    title: "Education Support for Rural Schools",
    description: "Raising funds to provide educational resources and technology for underprivileged rural schools. We aim to equip classrooms with computers and learning materials.",
    target: "2.5",
    deadline: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days from now
    amountCollected: "0.5",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800",
    claimed: false
  },
  {
    id: 3,
    owner: "0x789...",
    title: "Urban Art Gallery Project",
    description: "Creating a public art space in the city center. Completely different from education projects.",
    target: "2.6", // Similar target but different context
    deadline: Math.floor(Date.now() / 1000) + (60 * 24 * 60 * 60), // Different deadline
    amountCollected: "1.2",
    image: "https://images.unsplash.com/photo-1577083552431-6e5fd01988ec?w=800",
    claimed: false
  },
  {
    id: 4,
    owner: "0xabc...",
    title: "Tech Education Fund",
    description: "Providing computers and technology education, focusing on rural schools and underprivileged areas.",
    target: "10", // Different target
    deadline: Math.floor(Date.now() / 1000) + (31 * 24 * 60 * 60), // Similar deadline to #1
    amountCollected: "2.5",
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800",
    claimed: false
  },
  {
    id: 5,
    owner: "0xdef...",
    title: "Community Library Project",
    description: "Building a community library with educational resources. While different from a school project, it's still education-related.",
    target: "2.4", // Very similar target to #1
    deadline: Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60), // Very different deadline
    amountCollected: "0.3",
    image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800",
    claimed: false
  },
  {
    id: 2,
    owner: "0x456...",
    title: "Rural Education Initiative",
    description: "Supporting rural education by providing technology and learning materials to schools in remote areas. Focus on computer literacy and digital education.",
    target: "2.8", // Similar target to #1
    deadline: Math.floor(Date.now() / 1000) + (32 * 24 * 60 * 60), // Close deadline to #1
    amountCollected: "0.8",
    image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800",
    claimed: false
  },
];
