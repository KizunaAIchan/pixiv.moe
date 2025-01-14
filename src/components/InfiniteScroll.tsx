import React, { useContext } from 'react';
import { useEventListener } from 'ahooks';
import { SiteContext } from '../stores/SiteStore';

interface InfiniteScrollProps {
  distance: number;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
}

const InfiniteScroll: React.FC<InfiniteScrollProps> = props => {
  const site = useContext(SiteContext);

  const scrollingElement = site.contentElement;

  const onScroll = (event: React.UIEvent) => {
    if (props.isLoading) {
      return;
    }

    if (!props.hasMore) {
      return;
    }

    const target = event.target as HTMLElement;
    const targetHeight = target.clientHeight;
    const scrollTop = target.scrollTop;
    const scrollHeight = target.scrollHeight;

    if (scrollTop + targetHeight - scrollHeight > -1 * props.distance) {
      props.onLoadMore();
    }
  };

  useEventListener('scroll', onScroll, {
    target: scrollingElement
  });

  return <>{props.children}</>;
};

export default InfiniteScroll;
