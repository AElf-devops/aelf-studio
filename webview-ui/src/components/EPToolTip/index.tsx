import { Tooltip, ITooltipProps } from 'aelf-design';
import clsx from 'clsx';
import { ReactNode } from 'react';
import { TooltipPlacement } from 'antd/es/tooltip';
import './index.css';

interface IToolTip
  extends Omit<
    ITooltipProps,
    'children' | 'color' | 'overlayClassName' | 'arrow' | 'placement'
  > {
  pointAtCenter?: boolean;
  children: ReactNode;
  mode: 'light' | 'dark';
  className?: string;
  placement?: TooltipPlacement;
}

export default function EPTooltip({
  children,
  pointAtCenter = true,
  trigger,
  className,
  placement = 'topLeft',
  mode = 'dark',
  ...params
}: IToolTip) {
  return (
    <Tooltip
      overlayClassName={clsx(
        mode === 'light' ? 'tooltip-light' : 'tooltip-dark',
        className,
      )}
      color={mode === 'dark' ? '#1D2A51' : '#FFFFFF'}
      trigger={trigger || 'hover'}
      arrow={{ pointAtCenter: pointAtCenter }}
      placement={placement}
      {...params}
    >
      {children}
    </Tooltip>
  );
}
