// created by David Jensen
/*
Change log by ChingCLee
- remedy the defect that the original script fails when there is no locked Background layer at the bottom, - when merging group of layers, original script choose the upmost layer in this group as a resulting name, I modify to choose group name as the resulting merged name.
- when there is just one layer in selection, the funciton originally merge down and use the upper layer's name as the result, which I revert to using the lower layer's name.
*/

app.activeDocument.suspendHistory('Merge Layers', 'main()');
function main() {
   var idxShift = 0;
   var hasBG = true;
   try {
      activeDocument.layers.getByName("Background");
   }
   catch (e) { hasBG = false; }

   if (!hasBG) {
      idxShift = 1;
   }

   x = getSelectedLayerNames();
   var specialName;
   try {
      if (x.length == 1) {
         idx = getSelectedLayersIdx()[0];
         if (activeDocument.activeLayer.typename === "LayerSet") {
            specialName = getLayerNameByIndex(idx + idxShift);
         }
         else {
            specialName = getLayerNameByIndex(idx + idxShift - 1);
         }
      } else {
         specialName = x[0];
         generatedNames = new RegExp(/(?:(?:Group|Layer|(?:Color|Gradient|Pattern) Fill|Brightness\/Contrast|Levels|Curves|Exposure|Vibrance|Hue\/Saturation|Color Balance|Black & White|Photo Filter|Channel Mixer|Invert|Posterize|Threshold|Gradient Map|Selective Color|Shape) [0-9]+|Background)(?: copy(?: [0-9]+)?)?/)
         for (i = 0; i < x.length - 1; i++) {
            if (x[i] != x[i].match(generatedNames)) {
               specialName = x[i]
               break;
            }
         }
      }
      executeAction(charIDToTypeID("Mrg2"), undefined, DialogModes.NO);
      activeDocument.activeLayer.name = specialName;
   } catch (e) { }

   ////// Mike Hale from ps-scripts.com wrote the following functions
   function getSelectedLayerNames() {
      var names = [];
      var selectedIdxs = getSelectedLayersIdx();
      for (var l = 0; l < selectedIdxs.length; l++) {
         names.push(getLayerNameByIndex(selectedIdxs[l] + idxShift));
      }
      return names;
   }
   function getSelectedLayersIdx() {
      var selectedLayers = new Array;
      var ref = new ActionReference();
      ref.putEnumerated(charIDToTypeID("Dcmn"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
      var desc = executeActionGet(ref);
      if (desc.hasKey(stringIDToTypeID('targetLayers'))) {
         desc = desc.getList(stringIDToTypeID('targetLayers'));
         var c = desc.count
         var selectedLayers = new Array();
         for (var i = 0; i < c; i++) {
            selectedLayers.push(desc.getReference(i).getIndex());
         }
      } else {
         try {
            activeDocument.backgroundLayer;
            var mod = 1;
         } catch (e) {
            var mod = 0
         }
         var ref = new ActionReference();
         ref.putProperty(charIDToTypeID("Prpr"), charIDToTypeID("ItmI"));
         ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
         selectedLayers.push(executeActionGet(ref).getInteger(charIDToTypeID("ItmI")) - mod);
      }
      return selectedLayers;
   }
   function getLayerNameByIndex(idx) {
      var ref = new ActionReference();
      ref.putProperty(charIDToTypeID("Prpr"), charIDToTypeID("Nm  "));
      ref.putIndex(charIDToTypeID("Lyr "), idx);
      return executeActionGet(ref).getString(charIDToTypeID("Nm  "));;
   }
}