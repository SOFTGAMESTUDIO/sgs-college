// components/dashboard/StatCard.jsx
import React from 'react';
import { 
  TrendingUp, 
  TrendingDown,
  ChevronRightCircle,
} from 'lucide-react';
import PropTypes from 'prop-types';

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color = 'blue',
  change,
  subtitle,
  link,
  loading = false,
  onClick,
  className = ''
}) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      text: 'text-blue-600',
      border: 'hover:border-blue-300'
    },
    green: {
      bg: 'bg-green-50',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      text: 'text-green-600',
      border: 'hover:border-green-300'
    },
    purple: {
      bg: 'bg-purple-50',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      text: 'text-purple-600',
      border: 'hover:border-purple-300'
    },
    amber: {
      bg: 'bg-amber-50',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      text: 'text-amber-600',
      border: 'hover:border-amber-300'
    },
    red: {
      bg: 'bg-red-50',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      text: 'text-red-600',
      border: 'hover:border-red-300'
    },
    indigo: {
      bg: 'bg-indigo-50',
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
      text: 'text-indigo-600',
      border: 'hover:border-indigo-300'
    },
    emerald: {
      bg: 'bg-emerald-50',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      text: 'text-emerald-600',
      border: 'hover:border-emerald-300'
    },
    gray: {
      bg: 'bg-gray-50',
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-600',
      text: 'text-gray-600',
      border: 'hover:border-gray-300'
    }
  };

  const colors = colorClasses[color] || colorClasses.blue;

  const CardContent = (
    <div className={`p-6 rounded-xl border border-gray-200 transition-all duration-200 ${colors.border} ${className} ${onClick || link ? 'cursor-pointer hover:shadow-md' : ''}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            {title}
          </h3>
          {loading ? (
            <div className="mt-2">
              <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
              {subtitle && (
                <div className="h-4 w-32 bg-gray-100 rounded animate-pulse mt-1"></div>
              )}
            </div>
          ) : (
            <>
              <div className="mt-2 flex items-baseline">
                <p className="text-3xl font-bold text-gray-900">
                  {typeof value === 'number' ? value.toLocaleString() : value}
                </p>
                {change && (
                  <span className={`ml-2 flex items-center text-sm font-medium ${change.startsWith('+') || (typeof change === 'number' && change >= 0) ? 'text-green-600' : 'text-red-600'}`}>
                    {typeof change === 'number' ? (
                      change >= 0 ? (
                        <TrendingUp className="w-4 h-4 mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 mr-1" />
                      )
                    ) : change.startsWith('+') ? (
                      <TrendingUp className="w-4 h-4 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 mr-1" />
                    )}
                    {typeof change === 'number' 
                      ? `${Math.abs(change)}%` 
                      : change
                    }
                  </span>
                )}
              </div>
              {subtitle && (
                <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
              )}
            </>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {Icon && (
            <div className={`p-3 rounded-lg ${colors.iconBg} transition-colors duration-200`}>
              <Icon className={`w-6 h-6 ${colors.iconColor}`} />
            </div>
          )}
          {(onClick || link) && (
            <ChevronRightCircle className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
          )}
        </div>
      </div>

      {/* Progress bar for some metrics */}
      {change && typeof change === 'number' && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Progress</span>
            <span>{Math.abs(change)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${change >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
              style={{ width: `${Math.min(Math.abs(change), 100)}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );

  if (link) {
    return (
      <a href={link} className="block group">
        {CardContent}
      </a>
    );
  }

  if (onClick) {
    return (
      <button onClick={onClick} className="block w-full text-left group">
        {CardContent}
      </button>
    );
  }

  return CardContent;
};

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.elementType,
  color: PropTypes.oneOf([
    'blue', 'green', 'purple', 'amber', 'red', 
    'indigo', 'emerald', 'gray', 'orange'
  ]),
  change: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  subtitle: PropTypes.string,
  link: PropTypes.string,
  loading: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string
};

export default StatCard;