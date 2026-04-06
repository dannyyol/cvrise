import React from 'react';
import { useCVStore } from '@/src/store/useCVStore';
import { Input } from '@/src/components/ui/Form';
import { GitHubIcon, LinkedInIcon } from '@/src/components/ui/SocialIcons';
import { User, Mail, Phone, MapPin, Globe, Briefcase } from 'lucide-react';

export const PersonalDetailsForm = () => {
  const { cvData, updatePersonalDetails } = useCVStore();
  const { personalDetails } = cvData;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updatePersonalDetails({ [name]: value });
  };

  return (
    <div className="form-container personal-details-form">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Personal Details</h3>
          <p className="text-sm text-gray-500">Basic contact info employers use to reach you.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Full Name"
          name="fullName"
          value={personalDetails.fullName}
          onChange={handleChange}
          icon={<User className="w-4 h-4" />}
          placeholder="e.g. John Doe"
          className="input-field-borderless"
        />

        <Input
          label="Job Title"
          name="jobTitle"
          value={personalDetails.jobTitle}
          onChange={handleChange}
          icon={<Briefcase className="w-4 h-4" />}
          placeholder="e.g. Senior Software Engineer"
          className="input-field-borderless"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Email"
          type="email"
          name="email"
          value={personalDetails.email}
          onChange={handleChange}
          icon={<Mail className="w-4 h-4" />}
          placeholder="e.g. john@example.com"
          className="input-field-borderless"
        />
        <Input
          label="Phone"
          type="tel"
          name="phone"
          value={personalDetails.phone}
          onChange={handleChange}
          icon={<Phone className="w-4 h-4" />}
          placeholder="e.g. +1 (555) 000-0000"
          className="input-field-borderless"
        />
      </div>

      <Input
        label="Address"
        name="address"
        value={personalDetails.address}
        onChange={handleChange}
        icon={<MapPin className="w-4 h-4" />}
        placeholder="e.g. New York, NY"
        className="input-field-borderless"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="LinkedIn"
          name="linkedin"
          value={personalDetails.linkedin}
          onChange={handleChange}
          icon={<LinkedInIcon className="w-4 h-4" />}
          placeholder="linkedin.com/in/johndoe"
          className="input-field-borderless"
        />
        <Input
          label="GitHub"
          name="github"
          value={personalDetails.github}
          onChange={handleChange}
          icon={<GitHubIcon className="w-4 h-4" />}
          placeholder="github.com/johndoe"
          className="input-field-borderless"
        />
      </div>

      <Input
        label="Website"
        name="website"
        value={personalDetails.website}
        onChange={handleChange}
        icon={<Globe className="w-4 h-4" />}
        placeholder="www.johndoe.com"
        className="input-field-borderless"
      />
    </div>
  );
};
