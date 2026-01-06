export const getStatusColor = (status?: string): string => {
  switch (status) {
    case "planning":
      return "bg-gray-500";
    case "in_progress":
      return "bg-blue-500";
    case "on_hold":
      return "bg-yellow-500";
    case "completed":
      return "bg-green-500";
    case "cancelled":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
};

export const getStatusLabel = (status?: string): string => {
  switch (status) {
    case "planning":
      return "Planning";
    case "in_progress":
      return "In Progress";
    case "on_hold":
      return "On Hold";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
    default:
      return "Planning";
  }
};
