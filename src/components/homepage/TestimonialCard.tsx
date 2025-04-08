
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface TestimonialCardProps {
  quote: string;
  name: string;
  title: string;
  image: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ quote, name, title, image }) => {
  return (
    <Card className="border shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <CardContent className="pt-6 pb-6 flex flex-col h-full">
        <div className="mb-4 text-primary">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.5 8H5.5C4.67 8 4 8.67 4 9.5V11.5C4 12.33 4.67 13 5.5 13H7.5C8.33 13 9 13.67 9 14.5V16.5C9 17.33 8.33 18 7.5 18H5.5C4.67 18 4 17.33 4 16.5V15M19.5 8H15.5C14.67 8 14 8.67 14 9.5V11.5C14 12.33 14.67 13 15.5 13H17.5C18.33 13 19 13.67 19 14.5V16.5C19 17.33 18.33 18 17.5 18H15.5C14.67 18 14 17.33 14 16.5V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p className="italic mb-6 flex-grow">{quote}</p>
        <div className="flex items-center mt-auto">
          <img src={image} alt={name} className="w-12 h-12 rounded-full mr-4" />
          <div>
            <p className="font-medium">{name}</p>
            <p className="text-sm text-muted-foreground">{title}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestimonialCard;
