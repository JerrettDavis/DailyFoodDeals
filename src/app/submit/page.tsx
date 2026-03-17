import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { submitDeal } from "@/actions/deals";
import { DeploymentStatusNotice } from "@/components/system/DeploymentStatusNotice";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { CalendarIcon, MapPinIcon, PlusIcon, SparklesIcon } from "@/components/ui/icons";
import { canUseRuntimeAuth, hasRuntimeDatabase } from "@/lib/runtime-config";
import { CUISINE_TYPES, DEAL_CATEGORIES, DEAL_OPTION_FIELDS, DAY_NAMES } from "@/lib/utils";

interface SubmitDealPageProps {
  searchParams?: Promise<{
    error?: string;
    success?: string;
  }>;
}

const sectionTitleClass = "text-lg font-semibold text-white";

export default async function SubmitDealPage({ searchParams }: SubmitDealPageProps) {
  if (!canUseRuntimeAuth || !hasRuntimeDatabase) {
    return (
      <div className="px-4 py-12">
        <DeploymentStatusNotice
          title="Submissions are temporarily unavailable"
          message="This deployment is missing runtime authentication or database configuration, so new deals can't be submitted right now."
          actionHref="/deals"
          actionLabel="Browse available deals"
        />
      </div>
    );
  }

  const session = await auth();
  if (!session) redirect("/auth/signin");
  const resolvedSearchParams = await searchParams;
  const error = resolvedSearchParams?.error;
  const success = resolvedSearchParams?.success;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <PageHeader
        eyebrow="Share a great find"
        title="Submit a Deal"
        description="Share a great food deal with the community. Deals are reviewed before being published, so better detail means faster moderation."
      />

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        {[
          {
            icon: <MapPinIcon size={18} />,
            title: "Add location context",
            description: "Restaurant address and optional coordinates help the new map experience place your deal correctly.",
          },
          {
            icon: <SparklesIcon size={18} />,
            title: "Be specific",
            description: "Clear title, price info, and restrictions help people decide fast.",
          },
          {
            icon: <CalendarIcon size={18} />,
            title: "List the schedule",
            description: "Deals with accurate days and times are much easier for the community to trust.",
          },
        ].map((item) => (
          <Card key={item.title} className="p-5" variant="muted">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-300">
              {item.icon}
            </div>
            <h2 className="mt-4 text-lg font-semibold text-white">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-gray-400">{item.description}</p>
          </Card>
        ))}
      </div>

      {success ? (
        <div className="mb-6 rounded-2xl border border-green-400/20 bg-green-500/10 px-4 py-3 text-sm text-green-100">
          {success}
        </div>
      ) : null}
      {error ? (
        <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      <form action={submitDeal} className="space-y-6">
        <Card className="p-6 sm:p-8">
          <div className="mb-6">
            <h2 className={sectionTitleClass}>Restaurant Info</h2>
            <p className="mt-2 text-sm leading-6 text-gray-400">
              Start with the place itself so moderation and map placement are easier later.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <FormField label="Restaurant Name" htmlFor="restaurantName" required>
                <Input id="restaurantName" name="restaurantName" required placeholder="e.g., Joe's Burger Shack" />
              </FormField>
            </div>
            <div className="md:col-span-2">
              <FormField label="Address" htmlFor="restaurantAddress" required>
                <Input id="restaurantAddress" name="restaurantAddress" required placeholder="123 Main St" />
              </FormField>
            </div>
            <FormField label="City" htmlFor="restaurantCity" required>
              <Input id="restaurantCity" name="restaurantCity" required />
            </FormField>
            <FormField label="State" htmlFor="restaurantState" required hint="Use the two-letter state abbreviation.">
              <Input id="restaurantState" name="restaurantState" required placeholder="TX" maxLength={2} />
            </FormField>
            <FormField label="Zip Code" htmlFor="restaurantZip" required>
              <Input id="restaurantZip" name="restaurantZip" required placeholder="12345" />
            </FormField>
            <FormField label="Phone" htmlFor="restaurantPhone">
              <Input id="restaurantPhone" name="restaurantPhone" placeholder="(512) 555-0101" />
            </FormField>
            <div className="md:col-span-2">
              <FormField label="Website" htmlFor="restaurantWebsite">
                <Input id="restaurantWebsite" name="restaurantWebsite" type="url" placeholder="https://restaurant.com" />
              </FormField>
            </div>
            <FormField label="Latitude" htmlFor="restaurantLatitude" hint="Optional, but useful for the new map view.">
              <Input id="restaurantLatitude" name="restaurantLatitude" type="number" step="any" placeholder="30.2672" />
            </FormField>
            <FormField label="Longitude" htmlFor="restaurantLongitude" hint="Add both latitude and longitude together.">
              <Input id="restaurantLongitude" name="restaurantLongitude" type="number" step="any" placeholder="-97.7431" />
            </FormField>
          </div>
        </Card>

        <Card className="p-6 sm:p-8">
          <div className="mb-6">
            <h2 className={sectionTitleClass}>Deal Info</h2>
            <p className="mt-2 text-sm leading-6 text-gray-400">
              Describe the value clearly so someone can understand it in under five seconds.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <FormField label="Deal Title" htmlFor="title" required>
                <Input id="title" name="title" required placeholder="e.g., Happy Hour 50% Off Appetizers" />
              </FormField>
            </div>
            <div className="md:col-span-2">
              <FormField label="Description" htmlFor="description" required>
                <Textarea id="description" name="description" required rows={4} placeholder="Describe the deal in detail..." />
              </FormField>
            </div>
            <div className="md:col-span-2">
              <FormField label="Price Info" htmlFor="priceInfo">
                <Input id="priceInfo" name="priceInfo" placeholder="e.g., $5 off, 50% off, $9.99 special" />
              </FormField>
            </div>
            <FormField label="Cuisine Type" htmlFor="cuisineType">
              <Select id="cuisineType" name="cuisineType">
                <option value="">Select cuisine...</option>
                {CUISINE_TYPES.map((cuisine) => (
                  <option key={cuisine} value={cuisine}>
                    {cuisine}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Category" htmlFor="category">
              <Select id="category" name="category">
                <option value="">Select category...</option>
                {DEAL_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>
        </Card>

        <Card className="p-6 sm:p-8">
          <div className="mb-6">
            <h2 className={sectionTitleClass}>Schedule</h2>
            <p className="mt-2 text-sm leading-6 text-gray-400">
              Add at least one day. Use the same time range for every selected day.
            </p>
          </div>

          <div className="space-y-5">
            <FormField label="Available Days" required>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {DAY_NAMES.map((day, i) => (
                  <label
                    key={day}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-gray-200"
                  >
                    <input
                      type="checkbox"
                      name="days"
                      value={String(i)}
                      className="h-4 w-4 rounded border-white/20 bg-transparent text-orange-400 focus:ring-orange-400"
                    />
                    {day}
                  </label>
                ))}
              </div>
            </FormField>

            <div className="grid gap-5 md:grid-cols-2">
              <FormField label="Start Time" htmlFor="startTime">
                <Input id="startTime" type="time" name="startTime" defaultValue="11:00" />
              </FormField>
              <FormField label="End Time" htmlFor="endTime">
                <Input id="endTime" type="time" name="endTime" defaultValue="14:00" />
              </FormField>
            </div>
          </div>
        </Card>

        <Card className="p-6 sm:p-8">
          <div className="mb-6">
            <h2 className={sectionTitleClass}>Options</h2>
            <p className="mt-2 text-sm leading-6 text-gray-400">
              These details make the cards and filters more useful right away.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {DEAL_OPTION_FIELDS.map(({ name, label }) => (
              <label
                key={name}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-gray-200"
              >
                <input type="checkbox" name={name} className="h-4 w-4 rounded border-white/20 bg-transparent text-orange-400 focus:ring-orange-400" />
                {label}
              </label>
            ))}
          </div>
        </Card>

        <Card className="p-6 sm:p-8">
          <div className="mb-6">
            <h2 className={sectionTitleClass}>Additional Info</h2>
            <p className="mt-2 text-sm leading-6 text-gray-400">
              Add a source link or moderator notes if they help verify the offer faster.
            </p>
          </div>
          <div className="grid gap-5">
            <FormField label="Source URL" htmlFor="sourceUrl">
              <Input id="sourceUrl" name="sourceUrl" type="url" placeholder="https://..." />
            </FormField>
            <FormField label="Notes" htmlFor="notes">
              <Textarea id="notes" name="notes" rows={3} placeholder="Any additional notes..." />
            </FormField>
          </div>
        </Card>

        <Button type="submit" size="lg" className="w-full">
          <PlusIcon size={18} />
          Submit Deal for Review
        </Button>
      </form>
    </div>
  );
}
