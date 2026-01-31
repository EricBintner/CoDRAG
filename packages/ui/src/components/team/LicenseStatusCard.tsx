import { Card, Badge, Button, ProgressBar } from '@tremor/react';
import { cn } from '../../lib/utils';
import type { LicenseInfo, LicenseTier } from '../../types';

export interface LicenseStatusCardProps {
  license: LicenseInfo;
  onUpgrade?: () => void;
  onManageLicense?: () => void;
  className?: string;
}

const tierConfig: Record<LicenseTier, { label: string; color: 'gray' | 'blue' | 'green' | 'purple' }> = {
  free: { label: 'Free', color: 'gray' },
  pro: { label: 'Pro', color: 'blue' },
  team: { label: 'Team', color: 'green' },
  enterprise: { label: 'Enterprise', color: 'purple' },
};

export function LicenseStatusCard({
  license,
  onUpgrade,
  onManageLicense,
  className,
}: LicenseStatusCardProps) {
  const { label, color } = tierConfig[license.tier];
  const showSeats = license.seats_used !== undefined && license.seats_total !== undefined;
  const seatPercent = showSeats ? (license.seats_used! / license.seats_total!) * 100 : 0;
  
  return (
    <Card className={cn('codrag-license-status-card', className)}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold">License</h3>
          <p className="text-xs text-gray-500 mt-1">
            CoDRAG {label} License
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge color={color}>{label}</Badge>
          {!license.valid && <Badge color="red">Invalid</Badge>}
        </div>
      </div>
      
      {/* Features */}
      {license.features.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-500 uppercase mb-2">Features</p>
          <div className="flex flex-wrap gap-1">
            {license.features.map((feature) => (
              <Badge key={feature} size="xs" color="gray">{feature}</Badge>
            ))}
          </div>
        </div>
      )}
      
      {/* Seats (Team/Enterprise) */}
      {showSeats && (
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span>Seats Used</span>
            <span>{license.seats_used} / {license.seats_total}</span>
          </div>
          <ProgressBar value={seatPercent} color={seatPercent > 90 ? 'red' : 'blue'} />
        </div>
      )}
      
      {/* Expiration */}
      {license.expires_at && (
        <p className="text-xs text-gray-500 mb-4">
          {license.valid ? 'Expires' : 'Expired'}: {license.expires_at}
        </p>
      )}
      
      {/* Actions */}
      <div className="flex gap-2">
        {license.tier === 'free' && onUpgrade && (
          <Button size="xs" onClick={onUpgrade}>
            Upgrade to Pro
          </Button>
        )}
        {onManageLicense && (
          <Button size="xs" variant="secondary" onClick={onManageLicense}>
            Manage License
          </Button>
        )}
      </div>
    </Card>
  );
}
