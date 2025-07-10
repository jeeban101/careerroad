export const courseOptions = [
  { value: "bcom", label: "B.Com (Bachelor of Commerce)" },
  { value: "btech", label: "B.Tech (Bachelor of Technology)" },
  { value: "bsc", label: "B.Sc (Bachelor of Science)" },
  { value: "bba", label: "BBA (Bachelor of Business Administration)" },
  { value: "ba", label: "BA (Bachelor of Arts)" },
  { value: "mba", label: "MBA (Master of Business Administration)" },
  { value: "mtech", label: "M.Tech (Master of Technology)" },
  { value: "msc", label: "M.Sc (Master of Science)" },
];

export const roleOptions = [
  { value: "product-manager", label: "Product Manager" },
  { value: "ux-designer", label: "UX Designer" },
  { value: "data-analyst", label: "Data Analyst" },
  { value: "software-engineer", label: "Software Engineer" },
  { value: "digital-marketer", label: "Digital Marketer" },
  { value: "business-analyst", label: "Business Analyst" },
  { value: "consultant", label: "Management Consultant" },
  { value: "data-scientist", label: "Data Scientist" },
];

export const getRoadmapKey = (course: string, role: string) => {
  return `${course}_${role}`;
};
