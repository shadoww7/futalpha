--[[

ill Hub — FUT Alpha Edition (WindUI Version - Fixed Hitbox Expander)

True Character-Centric Hitbox Expander & GC-based Stamina

Toggle UI Keybind: Right Shift
]]

-- ═══════════════════════════════════════════

-- SERVICES & PLAYER

-- ═══════════════════════════════════════════

local cloneref = (cloneref or clonereference or function(instance)

return instance
end)

local Players = cloneref(game:GetService("Players"))

local RunService = cloneref(game:GetService("RunService"))

local UserInputService = cloneref(game:GetService("UserInputService"))

local CoreGui = cloneref(game:GetService("CoreGui"))

local Workspace = cloneref(game:GetService("Workspace"))

local ReplicatedStorage = cloneref(game:GetService("ReplicatedStorage"))

local Debris = cloneref(game:GetService("Debris"))

local LP = Players.LocalPlayer

-- Cleanup older WindUI instances from CoreGui or PlayerGui

for _, v in pairs(CoreGui:GetChildren()) do

if v:IsA("ScreenGui") and (v.Name:find("Wind") or v.Name:find("wind")) then

    pcall(function() v:Destroy() end)

end
end

for _, v in pairs(LP.PlayerGui:GetChildren()) do

if v:IsA("ScreenGui") and (v.Name:find("Wind") or v.Name:find("wind")) then

    pcall(function() v:Destroy() end)

end
end

-- Restore hitboxes if already expanded in previous run

if shared._fakeLeft or shared._fakeRight or shared._fakeCollision then

pcall(function()

    local char = LP.Character

    if char then

        local realLeft = char:FindFirstChild("RealLeftFoot")

        local realRight = char:FindFirstChild("RealRightFoot")

        local realCollision = char:FindFirstChild("RealCollision")

        if realLeft then realLeft.Name = "LeftFoot" end

        if realRight then realRight.Name = "RightFoot" end

        if realCollision then realCollision.Name = "Collision" end

    end

end)
end

if shared._fakeLeft then pcall(function() shared._fakeLeft:Destroy() end) shared._fakeLeft = nil end

if shared._fakeRight then pcall(function() shared._fakeRight:Destroy() end) shared._fakeRight = nil end

if shared._fakeCollision then pcall(function() shared._fakeCollision:Destroy() end) shared._fakeCollision = nil end

-- Cleanup older connections

if shared._amberFUTConns then

for _, c in pairs(shared._amberFUTConns) do pcall(function() c:Disconnect() end) end
end

shared._amberFUTConns = {}

-- ═══════════════════════════════════════════

-- STATE CONFIGURATION

-- ═══════════════════════════════════════════

local State = {

ESP_Players   = false,

ESP_Ball      = false,

InfiniteStam  = false,

ReachEnabled  = false,

ReachDistance = 12,  -- Distance in studs
}

-- References to internal stamina structure

local internalStaminaTable = nil

local function updateInternalReferences()

for _, v in pairs(getgc(true)) do

    if type(v) == "table" and rawget(v, "CanSprint") and rawget(v, "Stamina") then

        internalStaminaTable = v

        break

    end

end
end

-- ═══════════════════════════════════════════

-- DYNAMIC HITBOX ENGINE (NO PHYSICS FREEZE)

-- ═══════════════════════════════════════════

local function expandHitbox()

local char = LP.Character

if not char then return end



local leftFoot = char:FindFirstChild("LeftFoot")

local rightFoot = char:FindFirstChild("RightFoot")

local collision = char:FindFirstChild("Collision")

local hrp = char:FindFirstChild("HumanoidRootPart")

if not hrp then return end



-- If already setup, just update sizes

if char:FindFirstChild("RealLeftFoot") then

    local sz = Vector3.new(State.ReachDistance, 1.5, State.ReachDistance)

    if shared._fakeLeft then shared._fakeLeft.Size = sz end

    if shared._fakeRight then shared._fakeRight.Size = sz end

    if shared._fakeCollision then shared._fakeCollision.Size = sz end

    return

end



-- Rename original foot part so game script connects Touched to our giant part instead!

if leftFoot and leftFoot.Name == "LeftFoot" then

    leftFoot.Name = "RealLeftFoot"

    

    local fakeLeft = Instance.new("Part")

    fakeLeft.Name = "LeftFoot"

    fakeLeft.Size = Vector3.new(State.ReachDistance, 1.5, State.ReachDistance)

    fakeLeft.Transparency = 1

    fakeLeft.CanCollide = false

    fakeLeft.Massless = true -- Crucial: 0 mass blocks character freezing/sinking!

    fakeLeft.Parent = char

    

    local weld = Instance.new("Weld")

    weld.Part0 = hrp

    weld.Part1 = fakeLeft

    weld.C0 = CFrame.new(-0.5, -1.8, 0)

    weld.Parent = fakeLeft

    

    shared._fakeLeft = fakeLeft

end



if rightFoot and rightFoot.Name == "RightFoot" then

    rightFoot.Name = "RealRightFoot"

    

    local fakeRight = Instance.new("Part")

    fakeRight.Name = "RightFoot"

    fakeRight.Size = Vector3.new(State.ReachDistance, 1.5, State.ReachDistance)

    fakeRight.Transparency = 1

    fakeRight.CanCollide = false

    fakeRight.Massless = true -- Crucial: 0 mass blocks character freezing/sinking!

    fakeRight.Parent = char

    

    local weld = Instance.new("Weld")

    weld.Part0 = hrp

    weld.Part1 = fakeRight

    weld.C0 = CFrame.new(0.5, -1.8, 0)

    weld.Parent = fakeRight

    

    shared._fakeRight = fakeRight

end

if collision and collision.Name == "Collision" then

    collision.Name = "RealCollision"

    

    local fakeCollision = Instance.new("Part")

    fakeCollision.Name = "Collision"

    fakeCollision.Size = Vector3.new(State.ReachDistance, 1.5, State.ReachDistance)

    fakeCollision.Transparency = 1

    fakeCollision.CanCollide = false

    fakeCollision.Massless = true -- Crucial: 0 mass blocks character freezing/sinking!

    fakeCollision.Parent = char

    

    local weld = Instance.new("Weld")

    weld.Part0 = hrp

    weld.Part1 = fakeCollision

    weld.C0 = CFrame.new(0, -1.8, 0)

    weld.Parent = fakeCollision

    

    shared._fakeCollision = fakeCollision

end
end

local function restoreHitbox()

local char = LP.Character

if not char then return end



local realLeft = char:FindFirstChild("RealLeftFoot")

local realRight = char:FindFirstChild("RealRightFoot")

local realCollision = char:FindFirstChild("RealCollision")



if realLeft then realLeft.Name = "LeftFoot" end

if realRight then realRight.Name = "RightFoot" end

if realCollision then realCollision.Name = "Collision" end



if shared._fakeLeft then pcall(function() shared._fakeLeft:Destroy() end) shared._fakeLeft = nil end

if shared._fakeRight then pcall(function() shared._fakeRight:Destroy() end) shared._fakeRight = nil end

if shared._fakeCollision then pcall(function() shared._fakeCollision:Destroy() end) shared._fakeCollision = nil end
end

-- ═══════════════════════════════════════════

-- WINDUI FRAMEWORK INITIALIZATION

-- ═══════════════════════════════════════════

local WindUI

do

local ok, result = pcall(function()

	return require("./src/Init")

end)

if ok then

	WindUI = result

else

	if RunService:IsStudio() or not writefile then

		WindUI = require(ReplicatedStorage:WaitForChild("WindUI"):WaitForChild("Init"))

	else

		WindUI =

			loadstring(game:HttpGet("https://raw.githubusercontent.com/Footagesus/WindUI/main/dist/main.lua"))()

	end

end
end

local ThemeName = "Dark"

local Window = WindUI:CreateWindow({

Title = "ilusions.lol v2 edition",

Author = "FUT Alpha Edition",

Icon = "solar:wind-bold",

Theme = ThemeName,

ToggleKey = Enum.KeyCode.RightShift,
})

Window:Tag({

Title = "v14.0-WindUI",

Color = "ElementBackground",
})

-- ═══════════════════════════════════════════

-- TABS SETUP

-- ═══════════════════════════════════════════

local MainTab = Window:Tab({

Title = "Main",

Icon = "warehouse",
})

local VisualsTab = Window:Tab({

Title = "ESP",

Icon = "eye",
})

local InfoTab = Window:Tab({

Title = "Info",

Icon = "badge-info",
})

-- ═══════════════════════════════════════════

-- TAB: MAIN ELEMENTS

-- ═══════════════════════════════════════════

local StamSection = MainTab:Section({

Title = "Stamina Hack",

Icon = "zap",

Box = true,

BoxBorder = true,
})

StamSection:Toggle({

Title = "Infinite Stamina",

Default = false,

Callback = function(value)

	State.InfiniteStam = value

	if value then

		updateInternalReferences()

	end

end,
})

local ReachSection = MainTab:Section({

Title = "Hitbox Expander (Reach)",

Icon = "terminal",

Box = true,

BoxBorder = true,
})

ReachSection:Toggle({

Title = "Enable Reach",

Default = false,

Callback = function(value)

	State.ReachEnabled = value

	if value then

		expandHitbox()

	else

		restoreHitbox()

	end

end,
})

ReachSection:Slider({

Title = "Reach Size (studs)",

Value = { Min = 4, Max = 30, Default = 12 },

Callback = function(value)

	State.ReachDistance = value

	if State.ReachEnabled then

		expandHitbox()

	end

end,
})

-- ═══════════════════════════════════════════

-- TAB: ESP ELEMENTS

-- ═══════════════════════════════════════════

local ESPSection = VisualsTab:Section({

Title = "ESP Settings",

Icon = "eye",

Box = true,

BoxBorder = true,
})

ESPSection:Toggle({

Title = "Highlight Players",

Default = false,

Callback = function(value)

	State.ESP_Players = value

end,
})

ESPSection:Toggle({

Title = "Highlight Ball",

Default = false,

Callback = function(value)

	State.ESP_Ball = value

end,
})

-- ═══════════════════════════════════════════

-- TAB: INFO & PARAGRAPHS

-- ═══════════════════════════════════════════

InfoTab:Paragraph({

Title = "ilusions.lol",

Desc = "Advanced FUT Alpha script with true character-centric Hitbox Expansion & GC stamina tracking.\n\nPress Right Shift to open/close menu.",
})

local HStack = InfoTab:HStack()

local VStackLeft = HStack:VStack()

local VStackRight = HStack:VStack()

VStackLeft:Button({

Title = "Reload UI",

Justify = "Center",

Icon = "refresh-ccw",

IconAlign = "Left",

Color = Color3.fromHex("#F44732"),

Callback = function()

	pcall(function()

        loadstring(readfile("C:\\Users\\rhuan\\Documents\\antigravity\\kind-curie\\amber_fut_ui.lua"))()

    end)

end,
})

VStackRight:Button({

Title = "Rejoin Server",

Justify = "Center",

Icon = "log-out",

IconAlign = "Left",

Color = Color3.fromHex("#f4b332"),

Callback = function()

	game:GetService("TeleportService"):Teleport(game.PlaceId, LP)

end,
})

-- ═══════════════════════════════════════════

-- HEARTBEAT LOOP (ESP & STAMINA & AUTO-SWAP RECOVERY)

-- ═══════════════════════════════════════════

local function getClosestMatchBall(hrp)

local ballEngine = Workspace:FindFirstChild("Game")

if ballEngine then

    ballEngine = ballEngine:FindFirstChild("Engine")

end

if not ballEngine then return nil end



local closestBall = nil

local closestDist = 99999



for _, b in ipairs(ballEngine:GetChildren()) do

    if b:IsA("BasePart") and b.Name == "Ball" then

        local dist = (b.Position - hrp.Position).Magnitude

        if dist < closestDist then

            closestDist = dist

            closestBall = b

        end

    end

end

return closestBall
end

-- Helper for ESP Highlights

local function applyESP(obj, color)

if not obj then return end

local h = obj:FindFirstChild("AmberESP")

if not h then

    h = Instance.new("Highlight")

    h.Name = "AmberESP"

    h.OutlineColor = Color3.fromRGB(255, 255, 255)

    h.OutlineTransparency = 0.5

    h.Parent = obj

end

h.FillColor = color

h.FillTransparency = 0.6
end

local function removeESP(obj)

if obj and obj:FindFirstChild("AmberESP") then

    obj.AmberESP:Destroy()

end
end

-- Hook connection event setup to automatically find stamina reference and re-inject hitbox on spawn

table.insert(shared._amberFUTConns, LP.CharacterAdded:Connect(function(char)

internalStaminaTable = nil

task.delay(1.5, function()

    if State.ReachEnabled then

        expandHitbox()

    end

    if State.InfiniteStam then

        updateInternalReferences()

    end

end)
end))

-- Heartbeat loop

table.insert(shared._amberFUTConns, RunService.Heartbeat:Connect(function()

local char = LP.Character

local hrp = char and char:FindFirstChild("HumanoidRootPart")



-- 1. Infinite Stamina Loop

if State.InfiniteStam and internalStaminaTable then

    pcall(function()

        internalStaminaTable.Stamina = 100

        internalStaminaTable.CanSprint = true

    end)

end

-- 2. ESP Players & Ball

for _, p in ipairs(Players:GetPlayers()) do

    if p ~= LP and p.Character then

        if State.ESP_Players then

            applyESP(p.Character, Color3.fromRGB(255, 230, 0))

        else

            removeESP(p.Character)

        end

    end

end

-- Ball ESP

if hrp and State.ESP_Ball then

    local closestBall = getClosestMatchBall(hrp)

    

    -- Clean up other highlights

    local ballEngine = Workspace:FindFirstChild("Game")

    if ballEngine then

        ballEngine = ballEngine:FindFirstChild("Engine")

    end

    if ballEngine then

        for _, b in ipairs(ballEngine:GetChildren()) do

            if b:IsA("BasePart") and b.Name == "Ball" and b ~= closestBall then

                removeESP(b)

            end

        end

    end

    

    if closestBall then

        applyESP(closestBall, Color3.fromRGB(0, 230, 255))

    end

else

    -- Remove all ball ESP if disabled

    local ballEngine = Workspace:FindFirstChild("Game")

    if ballEngine then

        ballEngine = ballEngine:FindFirstChild("Engine")

    end

    if ballEngine then

        for _, b in ipairs(ballEngine:GetChildren()) do

            removeESP(b)

        end

    end

end
end))

return "ilusions.lol WindUI loaded successfully!"
