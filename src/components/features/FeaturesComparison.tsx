
import React from "react";
import { Check, X } from "lucide-react";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

const FeaturesComparison: React.FC = () => {
  return (
    <div className="mt-24 mb-16">
      <h2 className="text-3xl font-bold text-center mb-4">How We Compare</h2>
      <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
        See why industry leaders choose AlchemyLab over traditional marketing platforms
      </p>
      
      <div className="rounded-lg border overflow-hidden max-w-4xl mx-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/3">Feature</TableHead>
              <TableHead className="w-1/3 text-center">AlchemyLab</TableHead>
              <TableHead className="w-1/3 text-center">Others</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">AI-Powered Insights</TableCell>
              <TableCell className="text-center text-green-600"><Check className="inline h-5 w-5" /></TableCell>
              <TableCell className="text-center text-muted-foreground"><X className="inline h-5 w-5" /></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Multi-Platform Integration</TableCell>
              <TableCell className="text-center text-green-600"><Check className="inline h-5 w-5" /></TableCell>
              <TableCell className="text-center text-muted-foreground">Limited</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Predictive Analytics</TableCell>
              <TableCell className="text-center text-green-600"><Check className="inline h-5 w-5" /></TableCell>
              <TableCell className="text-center text-muted-foreground"><X className="inline h-5 w-5" /></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Automated Optimization</TableCell>
              <TableCell className="text-center text-green-600"><Check className="inline h-5 w-5" /></TableCell>
              <TableCell className="text-center text-muted-foreground">Basic</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Real-time Alerts</TableCell>
              <TableCell className="text-center text-green-600"><Check className="inline h-5 w-5" /></TableCell>
              <TableCell className="text-center text-green-600"><Check className="inline h-5 w-5" /></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Content Creation Tools</TableCell>
              <TableCell className="text-center text-green-600"><Check className="inline h-5 w-5" /></TableCell>
              <TableCell className="text-center text-muted-foreground"><X className="inline h-5 w-5" /></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default FeaturesComparison;
