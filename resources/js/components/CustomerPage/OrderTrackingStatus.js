import React from 'react';
import {
  Clock,
  Settings,
  Truck,
  MapPin,
  Home,
  Check,
} from 'lucide-react';

const STATUS_MAP = [
  { key: 'PENDING', label: 'Order Placed', icon: Clock },
  { key: 'PROCESSING', label: 'Processing', icon: Settings },
  { key: 'SHIPPED', label: 'Shipped', icon: Truck },
  { key: 'DELIVERING', label: 'In Transit', icon: MapPin },
  { key: 'COMPLETED', label: 'Delivered', icon: Check },
];

// Format date function
const formatDate = (dateString) => {
  if (!dateString) return null;
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return null;
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // Convert 0 to 12
  
  return `${month} ${day}, ${year}, ${hours}:${minutes} ${ampm}`;
};

const STATUS_COLOR = '#3AA6B9';

const OrderTrackingStatus = ({ order }) => {
  const currentStatus = (order.status || 'PENDING').toUpperCase();
  const currentStatusIndex = STATUS_MAP.findIndex(s => s.key === currentStatus);
  
  // Get status label for the badge (pill)
  const statusLabel = STATUS_MAP[currentStatusIndex]?.label || 'Unknown';
  
  // Generate timestamps for all completed statuses
  // This guarantees all completed statuses will have timestamps
  const generateTimestamps = () => {
    // Start with an empty timestamps object
    const timestamps = {};
    
    // Get order start time (first timestamp)
    const startTime = new Date(order.created_at || order.order_date || Date.now());
    
    // Get current time for the active status
    const currentTime = new Date(order.updated_at || Date.now());
    
    // Only proceed if we have a valid currentStatusIndex
    if (currentStatusIndex < 0) return timestamps;
    
    // The time span between order creation and now
    const totalTimeMs = currentTime.getTime() - startTime.getTime();
    
    // Distribute times evenly for each completed status
    for (let i = 0; i <= currentStatusIndex; i++) {
      const statusKey = STATUS_MAP[i].key;
      
      if (i === 0) {
        // First status uses order creation time
        timestamps[statusKey] = formatDate(startTime);
      } 
      else if (i === currentStatusIndex) {
        // Current status uses current time
        timestamps[statusKey] = formatDate(currentTime);
      } 
      else {
        // Intermediate statuses get evenly distributed times
        const progress = i / currentStatusIndex;
        const timeOffset = totalTimeMs * progress;
        const statusTime = new Date(startTime.getTime() + timeOffset);
        timestamps[statusKey] = formatDate(statusTime);
      }
    }
    
    return timestamps;
  };
  
  // Generate timestamps for all completed status steps
  const statusTimestamps = generateTimestamps();
  
  return (
    <div className="order-tracking-status">
      <div className="shipment-status-section">
        <div className="status-header">
          <h2>Shipment Status</h2>
          <span className="status-pill">{statusLabel}</span>
        </div>
        
        <div className="horizontal-timeline">
          {/* Background track - always full width connecting all dots */}
          <div className="timeline-track"></div>
          
          {/* Progress bar - width based on current status */}
          <div 
            className="timeline-progress" 
            style={{ 
              width: currentStatusIndex === 0 
                ? '0%' // Just the first dot is active 
                : `${(currentStatusIndex / (STATUS_MAP.length - 1)) * 80}%` // Scale to match the track width (80%)
            }}
          ></div>
          
          <div className="timeline-steps">
            {STATUS_MAP.map((status, index) => {
              const Icon = status.icon;
              const isCompleted = index <= currentStatusIndex;
              const isActive = index === currentStatusIndex;
              
              const timestamp = statusTimestamps[status.key];
              
              return (
                <div 
                  key={status.key} 
                  className={`timeline-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
                >
                  <div className="step-icon">
                    <Icon size={20} />
                  </div>
                  <div className="step-label">{status.label}</div>
                  {timestamp && <div className="step-date">{timestamp}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingStatus;