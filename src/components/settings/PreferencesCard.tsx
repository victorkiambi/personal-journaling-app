import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface PreferencesCardProps {
  formData: {
    theme: string;
    emailNotifications: boolean;
  };
  onInputChange: (field: string, value: any) => void;
}

export default function PreferencesCard({ formData, onInputChange }: PreferencesCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
        <CardDescription>
          Customize your journaling experience
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="theme">Theme</Label>
          <Select
            value={formData.theme}
            onValueChange={(value) => onInputChange('theme', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="emailNotifications"
            checked={formData.emailNotifications}
            onCheckedChange={(checked) => onInputChange('emailNotifications', checked)}
          />
          <Label htmlFor="emailNotifications">
            Email Notifications
          </Label>
        </div>
      </CardContent>
    </Card>
  );
} 