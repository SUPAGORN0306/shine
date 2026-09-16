/**
 * Devices — แสดง 7 อุปกรณ์ + Energy Monitor + NILM
 */

import { useState } from 'react'
import { Zap, Activity, Gauge, Cpu } from 'lucide-react'
import type { Device, Permission } from '../../types'
import { MOCK_DEVICES } from '../../data/mockData'
import {
  getCurrentPowerW,
  getTodayEnergyKwh,
  getCurrentReading,
} from '../../services/energyService'
import { identifyDevices, NILM_DISCLAIMER } from '../../services/nilmService'
import { getAllPermissions, updatePermission } from '../../services/controlService'
import DeviceCard from '../../components/DeviceCard/DeviceCard'
import DeviceDetailModal from '../../components/DeviceDetailModal/DeviceDetailModal'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import EnergyCard from '../../components/EnergyCard/EnergyCard'
import { formatPower, formatEnergy, formatNumber } from '../../utils/formatting'
import './Devices.css'

export default function Devices() {
  const [permissions, setPermissions] = useState<Record<string, Permission>>(
    () => getAllPermissions()
  )
  const [detailDevice, setDetailDevice] = useState<Device | null>(null)

  const reading = getCurrentReading()
  const currentPower = getCurrentPowerW()
  const todayEnergy = getTodayEnergyKwh()
  const nilmResult = identifyDevices()

  const handleChangePermission = (deviceId: string, p: Permission) => {
    updatePermission(deviceId, p)
    setPermissions((prev) => ({ ...prev, [deviceId]: p }))
  }

  return (
    <div className="devices">
      {/* ---------- Energy Monitor ---------- */}
      <section>
        <Card
          title="Energy Monitor"
          subtitle="ข้อมูลรวมจากการวัด"
          actions={<Badge variant="primary" size="sm">Prototype Simulation</Badge>}
        >
          <div className="devices__monitor-grid">
            <EnergyCard
              label="Current Power"
              value={formatPower(currentPower)}
              icon={<Zap size={18} />}
              variant="primary"
            />
            <EnergyCard
              label="Voltage"
              value={formatNumber(reading.voltage, 0)}
              unit="V"
              icon={<Gauge size={18} />}
            />
            <EnergyCard
              label="Current"
              value={formatNumber(reading.current, 2)}
              unit="A"
              icon={<Activity size={18} />}
            />
            <EnergyCard
              label="Energy Today"
              value={formatEnergy(todayEnergy)}
              icon={<Cpu size={18} />}
              variant="success"
            />
          </div>
        </Card>
      </section>

      {/* ---------- Device Cards ---------- */}
      <section>
        <header className="devices__section-head">
          <h2 className="devices__section-title">อุปกรณ์ในบ้าน</h2>
          <span className="devices__section-hint">คลิกการ์ดเพื่อดูรายละเอียด</span>
        </header>
        <div className="devices__grid">
          {MOCK_DEVICES.map((d) => (
            <DeviceCard
              key={d.id}
              device={d}
              permission={permissions[d.id] ?? d.permission}
              onClick={() => setDetailDevice(d)}
            />
          ))}
        </div>
      </section>

      {/* ---------- Device Identification (NILM) ---------- */}
      <section>
        <Card
          title={NILM_DISCLAIMER.title}
          subtitle={NILM_DISCLAIMER.description}
          actions={<Badge variant="primary" size="sm">Prototype Simulation</Badge>}
        >
          <div className="devices__nilm-aggregate">
            <span className="devices__nilm-label">Aggregate Power</span>
            <span className="devices__nilm-value">
              {formatNumber(nilmResult.aggregatePowerW, 0)} W
            </span>
          </div>

          <ul className="devices__nilm-list">
            {nilmResult.devices.map((d) => (
              <li key={d.deviceId} className="devices__nilm-item">
                <span className="devices__nilm-device">{d.deviceName}</span>
                <span className="devices__nilm-power">
                  ~{formatNumber(d.estimatedPowerW, 0)} W
                </span>
              </li>
            ))}
            <li className="devices__nilm-item devices__nilm-item--other">
              <span className="devices__nilm-device">Other</span>
              <span className="devices__nilm-power">
                ~{formatNumber(nilmResult.otherPowerW, 0)} W
              </span>
            </li>
          </ul>

          <p className="devices__nilm-note">
            <strong>Future integration:</strong> {NILM_DISCLAIMER.futureNote.replace('Future integration: ', '')}
          </p>
        </Card>
      </section>

      {/* ---------- Device Detail Modal ---------- */}
      <DeviceDetailModal
        open={detailDevice !== null}
        device={detailDevice}
        permission={
          detailDevice ? permissions[detailDevice.id] ?? detailDevice.permission : 'ASK'
        }
        onChangePermission={(p) => {
          if (detailDevice) handleChangePermission(detailDevice.id, p)
        }}
        onClose={() => setDetailDevice(null)}
      />
    </div>
  )
}
