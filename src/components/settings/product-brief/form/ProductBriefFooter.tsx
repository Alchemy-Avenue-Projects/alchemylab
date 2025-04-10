
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";

interface ProductBriefFooterProps {
  index: number;
  onSave: (index: number) => void;
  isSaving: boolean;
}

const ProductBriefFooter: React.FC<ProductBriefFooterProps> = ({
  index,
  onSave,
  isSaving
}) => {
  return (
    <Button 
      className="alchemy-gradient" 
      onClick={() => onSave(index)}
      disabled={isSaving}
    >
      {isSaving ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Saving...
        </>
      ) : (
        <>
          <Save className="h-4 w-4 mr-2" />
          Save Brief
        </>
      )}
    </Button>
  );
};

export default ProductBriefFooter;
