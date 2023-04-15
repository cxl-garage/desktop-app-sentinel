import { Button, Typography, Space } from 'antd';
import { MarketPlaceImage } from './MarketPlaceImage';
import smartAdapter from '../../../assets/marketplace/smart-adapter-placeholder.png';
import smartCamera from '../../../assets/marketplace/smart-camera-placeholder.png';
import outdoorSecurity from '../../../assets/marketplace/outdoor-security-placeholder.png';
import ecologicalSurveys from '../../../assets/marketplace/ecological-surveys-placeholder.png';
import preciseAnimalMonitoring from '../../../assets/marketplace/precise-animal-monitoring-placeholder.png';
import recreational from '../../../assets/marketplace/recreational-placeholder.png';

export function ModelMarketplaceView(): JSX.Element {
  return (
    <>
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
        <Button href="https://conservationxlabs.com/contact" target="_blank">
          Contact Us
        </Button>
      </div>
    </>
  );
}
