import { useVerification } from "../../../contexts/Verification";
import Button from "../button";
import AlbyDetected from "../widgets/AlbyDetected";
import AlbyNotDetected from "../widgets/AlbyNotDetected";

interface ExtensionSetupStepProps {
  //   username: string;
}

export const ExtensionSetupStep = ({}: ExtensionSetupStepProps) => {
  const { otToken } = useVerification();

  if (!otToken) {
    return (
      <>
        <div>Falta el OTToken</div>
        <Button onClick={() => window.history.back()} label='Volver' />
      </>
    );
  }

  return (
    <>
      <div className='mt-2 relative'>
        <div className='text-gray-500'>
          <h4 className='mt-3 mb-4 text-2xl text-center'>Extensión de Alby</h4>
          {window.webln ? <AlbyDetected /> : <AlbyNotDetected />}
        </div>
      </div>
    </>
  );
};

export default ExtensionSetupStep;
