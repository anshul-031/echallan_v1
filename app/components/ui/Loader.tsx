import { UserCircleIcon, DocumentTextIcon, TruckIcon, ClockIcon } from '@heroicons/react/24/outline';

type LoaderSize = 'sm' | 'md' | 'lg';

interface LoaderProps {
  size?: LoaderSize;
  showText?: boolean;
  text?: string;
  inline?: boolean;
  icon?: React.ReactNode;
}

const sizeConfig = {
  sm: {
    container: 'w-6 h-6',
    border: 'border-2',
    icon: 'w-3 h-3',
    dot: 'w-1 h-1'
  },
  md: {
    container: 'w-12 h-12',
    border: 'border-3',
    icon: 'w-5 h-5',
    dot: 'w-1.5 h-1.5'
  },
  lg: {
    container: 'w-24 h-24',
    border: 'border-4',
    icon: 'w-10 h-10',
    dot: 'w-2 h-2'
  }
};

export function Loader({ size = 'md', showText = false, text = 'Loading...', inline = false, icon }: LoaderProps) {
  const config = sizeConfig[size];

  return (
    <div className={`flex ${inline ? 'inline-flex' : 'flex-col'} justify-center items-center ${!inline ? 'py-6' : ''}`}>
      <div className={`relative ${config.container}`}>
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 animate-glow"></div>
        <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
          <div className={`w-full h-full rounded-full ${config.border} border-transparent border-t-blue-500 border-l-indigo-600 animate-dash-spin`}></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          {icon || <UserCircleIcon className={`${config.icon} text-blue-600 animate-pulse-dot`} />}
        </div>
        <div className="absolute inset-0 rounded-full overflow-hidden animate-shimmer"></div>
      </div>
      {showText && (
        <p className={`${inline ? 'ml-3' : 'mt-4'} text-gray-600 font-medium ${!inline && 'animate-pulse'}`}>
          {text}
        </p>
      )}
    </div>
  );
}

export function ButtonLoader() {
  return (
    <div className="relative w-5 h-5">
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-600 border-l-indigo-800 animate-dash-spin"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse-dot"></div>
      </div>
      <div className="absolute inset-0 rounded-full overflow-hidden animate-shimmer"></div>
    </div>
  );
}

export function DocumentLoader(props: Omit<LoaderProps, 'icon'>) {
  return <Loader {...props} icon={<DocumentTextIcon className={`${sizeConfig[props.size || 'md'].icon} text-blue-600 animate-pulse-dot`} />} />;
}

export function VehicleLoader(props: Omit<LoaderProps, 'icon'>) {
  return <Loader {...props} icon={<TruckIcon className={`${sizeConfig[props.size || 'md'].icon} text-blue-600 animate-pulse-dot`} />} />;
}

export function RenewalLoader(props: Omit<LoaderProps, 'icon'>) {
  return <Loader {...props} icon={<ClockIcon className={`${sizeConfig[props.size || 'md'].icon} text-blue-600 animate-pulse-dot`} />} />;
}

export function ProfileLoader(props: Omit<LoaderProps, 'icon'>) {
  return <Loader {...props} icon={<UserCircleIcon className={`${sizeConfig[props.size || 'md'].icon} text-blue-600 animate-pulse-dot`} />} />;
}

export default Loader; 