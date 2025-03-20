import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PersonalInfoCardProps {
  formData: {
    name: string;
    bio: string;
    location: string;
  };
  onInputChange: (field: string, value: string) => void;
}

export default function PersonalInfoCard({ formData, onInputChange }: PersonalInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>
          Update your personal details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => onInputChange('name', e.target.value)}
            placeholder="Your name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Input
            id="bio"
            value={formData.bio}
            onChange={(e) => onInputChange('bio', e.target.value)}
            placeholder="Tell us about yourself"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => onInputChange('location', e.target.value)}
            placeholder="Your location"
          />
        </div>
      </CardContent>
    </Card>
  );
} 