import React from 'react';

const iconProps = {
  className: "w-6 h-6",
  strokeWidth: 2,
  fill: "none",
  stroke: "currentColor",
  viewBox: "0 0 24 24",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const AppIcon = () => (
  <svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="256" cy="256" r="256" fill="hsl(216, 18%, 13%)"/>
    <path d="M256 120C190 120 140 170 140 236C140 266 155 293 178 310C170 320 165 332 165 345C165 375 189 400 219 400C235 400 249 392 256 380C263 392 277 400 293 400C323 400 347 375 347 345C347 332 342 320 334 310C357 293 372 266 372 236C372 170 322 120 256 120Z" stroke="hsl(198, 93%, 60%)" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M256 120V380" stroke="hsl(198, 93%, 60%)" strokeWidth="8" strokeDasharray="1 15" strokeLinecap="round"/>
    <path d="M210 180C190 190 180 210 180 230" stroke="hsl(198, 93%, 60%)" strokeWidth="10" strokeLinecap="round"/>
    <path d="M302 180C322 190 332 210 332 230" stroke="hsl(198, 93%, 60%)" strokeWidth="10" strokeLinecap="round"/>
  </svg>
);


export const UserIcon = () => (
  <svg {...iconProps}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
);

export const PillIcon = () => (
    <svg {...iconProps}><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"></path><path d="m8.5 8.5 7 7"></path></svg>
);

export const CalendarIcon = () => (
  <svg {...iconProps}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>
);

export const BookOpenIcon = () => (
  <svg {...iconProps}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
);

export const PlusIcon = () => (
  <svg {...iconProps} className="w-8 h-8"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" x2="19" y1="12" y2="12"></line></svg>
);

export const TrashIcon = () => (
    <svg {...iconProps} className="w-5 h-5"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line></svg>
);

export const BellIcon = () => (
    <svg {...iconProps}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
);

export const BellSlashIcon = () => (
    <svg {...iconProps}><path d="M13.73 21a2 2 0 0 1-3.46 0"></path><path d="M18.63 13A17.89 17.89 0 0 1 18 8"></path><path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14"></path><path d="m18 8-1-1"></path><path d="M2 2 22 22"></path></svg>
);

export const PhoneIcon = () => (
  <svg {...iconProps} className="w-5 h-5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
);

export const MessageIcon = () => (
  <svg {...iconProps} className="w-5 h-5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
);

export const SaveIcon = () => (
  <svg {...iconProps} className="w-5 h-5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
);

export const EditIcon = () => (
  <svg {...iconProps} className="w-5 h-5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
);

export const SparklesIcon = () => (
  <svg {...iconProps}><path d="M12 2L9.1 8.3L2 9.9L7.5 14.7L5.8 22L12 18.2L18.2 22L16.5 14.7L22 9.9L14.9 8.3L12 2z" /></svg>
);
