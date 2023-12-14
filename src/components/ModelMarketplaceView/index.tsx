import { Button, Typography, Space } from 'antd';
import { MarketPlaceImage } from './MarketPlaceImage';
import smartAdapter from '../../../assets/marketplace/smart-adapter.png';
import smartCamera from '../../../assets/marketplace/smart-camera.png';
import outdoorSecurity from '../../../assets/marketplace/outdoor-security.png';
import ecologicalSurveys from '../../../assets/marketplace/ecological-surveys.png';
import preciseAnimalMonitoring from '../../../assets/marketplace/precise-animal-monitoring.png';
import recreational from '../../../assets/marketplace/recreational.png';

export function ModelMarketplaceView(): JSX.Element {
  return (
    <div className="mt-12 pb-12">
      <div className="flex w-full justify-center">
        <Typography.Title level={2}>The Model Marketplace</Typography.Title>
      </div>
      <div className="flex w-full justify-center">
        <Space size="middle">
          <MarketPlaceImage
            src={outdoorSecurity}
            title="Outdoor Security"
            titleLevel={5}
          />
          <MarketPlaceImage
            src={ecologicalSurveys}
            title="Ecological surveys"
            titleLevel={5}
          />
          <MarketPlaceImage
            src={preciseAnimalMonitoring}
            title="Precise animal monitoring"
            titleLevel={5}
          />
          <MarketPlaceImage
            src={recreational}
            title="Recreational"
            titleLevel={5}
          />
        </Space>
      </div>
      <div className="mt-4 flex w-full justify-center">
        {/* NOTE: target _blank should only be used with noreferrer and
         * noopener to avoid tabnabbing security sissue. However antd
         * does not give any way of adding those to their Button component.
         * We are proceeding anyways because we are only linking to sites
         * owned by CXL so this is safe.
         */}
        <Button href="https://mysentinel.info" target="_blank">
          Browse Now
        </Button>
      </div>
      <div className="mt-12 flex w-full justify-center">
        <Typography.Title level={2}>The Sentinel</Typography.Title>
      </div>
      <div className="flex w-full justify-center">
        <Space size="large">
          <MarketPlaceImage
            src={smartAdapter}
            title="Smart Adapter"
            titleLevel={3}
          />
          <MarketPlaceImage
            src={smartCamera}
            title="Smart Camera"
            titleLevel={3}
          />
        </Space>
      </div>
      <div className="mt-4 flex w-full justify-center">
        <Button href="mailto:sentinel-support@conservationxlabs.org">
          Contact Us
        </Button>
      </div>
    </div>
  );
}
