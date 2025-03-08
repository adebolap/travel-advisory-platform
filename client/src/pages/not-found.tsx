import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex mb-4 gap-2 items-center"
          >
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-3xl font-bold text-foreground">404 Page Not Found</h1>
          </motion.div>

          <p className="mt-4 text-sm text-muted-foreground">
            Oops! The page you're looking for doesn't exist. You might have mistyped the URL or the page may have moved.
          </p>

          <Link href="/">
            <Button variant="secondary" className="mt-6 w-full">
              Go Back Home
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
