import '../../styles/LoadingState.css'

interface LoadingStateProps {
  count?: number;
}

export const LoadingState = ({ count = 4 }: LoadingStateProps) => {
  return (
    <div className="loading-grid">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="loading-card">
          <div className="loading-shimmer loading-circle"></div>
          <div className="loading-shimmer loading-line"></div>
          <div className="loading-shimmer loading-line large"></div>
        </div>
      ))}
    </div>
  );
}; 
