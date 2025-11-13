/**
 * Magazine Skeleton - Loading placeholder for magazine cards
 * Task 4.1: Add Skeleton Screens
 */

/**
 * Skeleton for the latest (featured) magazine card
 */
export function MagazineSkeletonLatest() {
  return (
    <div className="animate-pulse" style={{
      background: 'linear-gradient(135deg, #e0e0e0, #c0c0c0)',
      padding: '30px',
      borderRadius: '12px',
      border: '3px solid #d0d0d0',
      marginBottom: '50px'
    }}>
      {/* Title skeleton */}
      <div style={{
        height: '36px',
        background: 'rgba(255,255,255,0.4)',
        borderRadius: '8px',
        width: '70%',
        marginBottom: '10px'
      }}></div>

      {/* Description skeleton */}
      <div style={{ marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{
          height: '16px',
          background: 'rgba(255,255,255,0.3)',
          borderRadius: '4px',
          width: '90%'
        }}></div>
        <div style={{
          height: '16px',
          background: 'rgba(255,255,255,0.3)',
          borderRadius: '4px',
          width: '75%'
        }}></div>
      </div>

      {/* Metadata skeleton */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
        <div style={{
          height: '14px',
          background: 'rgba(255,255,255,0.3)',
          borderRadius: '4px',
          width: '120px'
        }}></div>
        <div style={{
          height: '14px',
          background: 'rgba(255,255,255,0.3)',
          borderRadius: '4px',
          width: '80px'
        }}></div>
      </div>

      {/* Button skeleton */}
      <div style={{
        height: '44px',
        background: 'rgba(255,255,255,0.2)',
        borderRadius: '6px',
        width: '180px'
      }}></div>
    </div>
  );
}

/**
 * Skeleton for older magazine cards
 */
export function MagazineSkeletonCard() {
  return (
    <div className="animate-pulse" style={{
      background: '#f8f9fa',
      border: '2px solid #ddd',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '20px'
    }}>
      {/* Title skeleton */}
      <div style={{
        height: '24px',
        background: '#e0e0e0',
        borderRadius: '6px',
        width: '60%',
        marginBottom: '10px'
      }}></div>

      {/* Description skeleton */}
      <div style={{ marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{
          height: '14px',
          background: '#e0e0e0',
          borderRadius: '4px',
          width: '100%'
        }}></div>
        <div style={{
          height: '14px',
          background: '#e0e0e0',
          borderRadius: '4px',
          width: '85%'
        }}></div>
      </div>

      {/* Metadata skeleton */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div style={{
          height: '12px',
          background: '#e0e0e0',
          borderRadius: '4px',
          width: '100px'
        }}></div>
        <div style={{
          height: '12px',
          background: '#e0e0e0',
          borderRadius: '4px',
          width: '70px'
        }}></div>
      </div>
    </div>
  );
}

/**
 * Grid of magazine skeletons for initial page load
 */
export function MagazineSkeletonGrid() {
  return (
    <>
      {/* Latest magazine skeleton */}
      <div style={{ marginBottom: '50px' }}>
        <div style={{
          height: '28px',
          background: '#e0e0e0',
          borderRadius: '6px',
          width: '180px',
          marginBottom: '20px'
        }} className="animate-pulse"></div>
        <MagazineSkeletonLatest />
      </div>

      {/* Older magazines skeleton */}
      <div>
        <div style={{
          height: '28px',
          background: '#e0e0e0',
          borderRadius: '6px',
          width: '220px',
          marginBottom: '20px'
        }} className="animate-pulse"></div>
        <div style={{ display: 'grid', gap: '20px' }}>
          <MagazineSkeletonCard />
          <MagazineSkeletonCard />
        </div>
      </div>
    </>
  );
}

/**
 * Skeleton for individual magazine viewer page
 */
export function MagazineViewerSkeleton() {
  return (
    <div className="animate-pulse" style={{ padding: '20px' }}>
      {/* Magazine header skeleton */}
      <div style={{
        background: 'linear-gradient(135deg, #e0e0e0, #c0c0c0)',
        padding: '30px',
        borderRadius: '12px',
        marginBottom: '30px'
      }}>
        <div style={{
          height: '36px',
          background: 'rgba(255,255,255,0.4)',
          borderRadius: '8px',
          width: '50%',
          marginBottom: '15px'
        }}></div>
        <div style={{
          height: '20px',
          background: 'rgba(255,255,255,0.3)',
          borderRadius: '6px',
          width: '70%'
        }}></div>
      </div>

      {/* Content items skeleton */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {[1, 2, 3].map((index) => (
          <div
            key={index}
            style={{
              background: '#f8f9fa',
              border: '2px solid #ddd',
              borderRadius: '8px',
              padding: '24px'
            }}
          >
            {/* Content header */}
            <div style={{
              height: '20px',
              background: '#e0e0e0',
              borderRadius: '6px',
              width: '40%',
              marginBottom: '15px'
            }}></div>

            {/* Content text */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
              <div style={{ height: '16px', background: '#e0e0e0', borderRadius: '4px', width: '100%' }}></div>
              <div style={{ height: '16px', background: '#e0e0e0', borderRadius: '4px', width: '95%' }}></div>
              <div style={{ height: '16px', background: '#e0e0e0', borderRadius: '4px', width: '88%' }}></div>
            </div>

            {/* Media placeholder */}
            <div style={{
              height: '200px',
              background: '#e0e0e0',
              borderRadius: '8px',
              marginBottom: '15px'
            }}></div>

            {/* Author info */}
            <div style={{
              height: '14px',
              background: '#e0e0e0',
              borderRadius: '4px',
              width: '150px'
            }}></div>
          </div>
        ))}
      </div>
    </div>
  );
}
