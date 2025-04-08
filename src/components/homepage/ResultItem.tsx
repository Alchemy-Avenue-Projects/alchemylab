
import React from "react";
import { CheckCircle2 } from "lucide-react";

interface ResultItemProps {
  metric: string;
  text: string;
}

const ResultItem: React.FC<ResultItemProps> = ({ metric, text }) => {
  return (
    <div className="flex">
      <div className="mr-4 text-primary">
        <CheckCircle2 className="h-6 w-6" />
      </div>
      <div>
        <span className="text-xl font-bold text-primary">{metric}</span>
        <span className="ml-2">{text}</span>
      </div>
    </div>
  );
};

export default ResultItem;
