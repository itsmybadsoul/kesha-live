export default function Test() {
  const activeTab = 'overview';
  return (
    <div>
      {activeTab === 'overview' && (<>
        <div>Hello</div>
      </>)}

      {activeTab === 'settlements' && (<>
        <div>World</div>
      </>)}
    </div>
  );
}
